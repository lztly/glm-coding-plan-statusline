/**
 * GSD Session Bridge
 * 用于与 GSD (Get Shit Done) 框架的会话状态桥接
 * 将上下文信息写入临时文件，支持跨进程/会话共享状态
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

/**
 * 生成 GSD 兼容的 bridge 文件路径
 * @param {string} sessionId - 会话 ID
 * @returns {string} 文件路径
 */
function getBridgeFilePath(sessionId) {
  return path.join(os.tmpdir(), `claude-ctx-${sessionId}.json`);
}

/**
 * 写入会话上下文到 bridge 文件
 * @param {object} params - 参数对象
 * @param {string} params.sessionId - 会话 ID
 * @param {number} params.remainingPercentage - 剩余百分比
 * @param {number} params.usedPct - 已使用百分比
 * @param {object} [params.extra] - 额外的自定义数据
 * @returns {boolean} 是否写入成功
 */
function writeBridge(params) {
  const { sessionId, remainingPercentage, usedPct, extra = {} } = params;

  if (!sessionId) {
    return false;
  }

  try {
    const bridgePath = getBridgeFilePath(sessionId);
    const bridgeData = {
      session_id: sessionId,
      remaining_percentage: remainingPercentage,
      used_pct: usedPct,
      timestamp: Math.floor(Date.now() / 1000),
      ...extra
    };

    fs.writeFileSync(bridgePath, JSON.stringify(bridgeData));
    return true;
  } catch (e) {
    // Silent fail -- bridge is best-effort, don't break statusline
    return false;
  }
}

/**
 * 读取会话上下文从 bridge 文件
 * @param {string} sessionId - 会话 ID
 * @returns {object|null} 上下文数据或 null
 */
function readBridge(sessionId) {
  if (!sessionId) {
    return null;
  }

  try {
    const bridgePath = getBridgeFilePath(sessionId);

    if (!fs.existsSync(bridgePath)) {
      return null;
    }

    const content = fs.readFileSync(bridgePath, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    return null;
  }
}

/**
 * 删除 bridge 文件
 * @param {string} sessionId - 会话 ID
 * @returns {boolean} 是否删除成功
 */
function removeBridge(sessionId) {
  if (!sessionId) {
    return false;
  }

  try {
    const bridgePath = getBridgeFilePath(sessionId);

    if (fs.existsSync(bridgePath)) {
      fs.unlinkSync(bridgePath);
    }
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 检查 bridge 文件是否存在且未过期
 * @param {string} sessionId - 会话 ID
 * @param {number} [ttlSeconds=3600] - 过期时间（秒），默认 1 小时
 * @returns {boolean} 是否有效
 */
function isBridgeValid(sessionId, ttlSeconds = 3600) {
  const data = readBridge(sessionId);

  if (!data || !data.timestamp) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  const age = now - data.timestamp;

  return age <= ttlSeconds;
}

/**
 * 列出所有活跃的 bridge 会话
 * @returns {Array<{sessionId: string, data: object}>} 会话列表
 */
function listActiveBridges() {
  try {
    const tmpDir = os.tmpdir();
    const files = fs.readdirSync(tmpDir);
    const bridgeFiles = files.filter(f => f.startsWith('claude-ctx-') && f.endsWith('.json'));

    return bridgeFiles.map(filename => {
      const sessionId = filename.replace('claude-ctx-', '').replace('.json', '');
      const data = readBridge(sessionId);
      return { sessionId, data };
    }).filter(item => item.data !== null);
  } catch (e) {
    return [];
  }
}

/**
 * 清理过期的 bridge 文件
 * @param {number} [ttlSeconds=3600] - 过期时间（秒），默认 1 小时
 * @returns {number} 清理的文件数量
 */
function cleanupExpiredBridges(ttlSeconds = 3600) {
  try {
    const tmpDir = os.tmpdir();
    const files = fs.readdirSync(tmpDir);
    const bridgeFiles = files.filter(f => f.startsWith('claude-ctx-') && f.endsWith('.json'));

    let cleaned = 0;
    const now = Math.floor(Date.now() / 1000);

    for (const filename of bridgeFiles) {
      const filePath = path.join(tmpDir, filename);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);

        if (data.timestamp && (now - data.timestamp > ttlSeconds)) {
          fs.unlinkSync(filePath);
          cleaned++;
        }
      } catch (e) {
        // 解析失败也删除
        try {
          fs.unlinkSync(filePath);
          cleaned++;
        } catch (e2) {
          // 忽略删除失败
        }
      }
    }

    return cleaned;
  } catch (e) {
    return 0;
  }
}

module.exports = {
  getBridgeFilePath,
  writeBridge,
  readBridge,
  removeBridge,
  isBridgeValid,
  listActiveBridges,
  cleanupExpiredBridges
};
