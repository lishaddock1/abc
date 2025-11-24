class FriendManager {
  constructor() {
    this.friends = new Map();
    this.friendsPath = '/Friends/';
  }

  async init() {
    await this.loadFriends();
  }

  async loadFriends() {
    try {
      // 使用思源API查询所有朋友文档
      const sql = `SELECT * FROM blocks WHERE path LIKE '${this.friendsPath}%' AND type = 'd'`;
      const result = await this.querySQL(sql);

      for (const block of result) {
        const friend = await this.parseFriendFromBlock(block);
        if (friend) {
          this.friends.set(friend.id, friend);
        }
      }
    } catch (error) {
      console.error('Failed to load friends:', error);
    }
  }

  async createFriend(friendData) {
    const friendId = await this.generateFriendId(friendData.name);
    const docPath = `${this.friendsPath}${friendData.name}.sy`;

    // 创建朋友文档
    const docContent = this.generateFriendDocument(friendData);

    try {
      // 使用思源API创建文档
      const result = await this.createDocument(docPath, docContent);

      // 设置文档属性
      await this.setFriendAttributes(result.id, friendData);

      const friend = {
        id: result.id,
        ...friendData,
        created: new Date().toISOString()
      };

      this.friends.set(friend.id, friend);
      return friend;

    } catch (error) {
      console.error('Failed to create friend:', error);
      throw error;
    }
  }

  async updateFriend(friendId, updates) {
    const friend = this.friends.get(friendId);
    if (!friend) {
      throw new Error('Friend not found');
    }

    // 更新文档属性
    await this.setFriendAttributes(friendId, updates);

    // 更新内存中的数据
    Object.assign(friend, updates);
    friend.updated = new Date().toISOString();

    return friend;
  }

  async searchFriends(query, filters = {}) {
    let results = Array.from(this.friends.values());

    // 文本搜索
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(friend =>
        friend.name.toLowerCase().includes(lowerQuery) ||
        friend.nickname?.toLowerCase().includes(lowerQuery) ||
        friend.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }

    // 关系类型过滤
    if (filters.relationship) {
      results = results.filter(friend => friend.relationship === filters.relationship);
    }

    // 标签过滤
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(friend =>
        filters.tags.every(tag => friend.tags?.includes(tag))
      );
    }

    return results;
  }

  async getFriendInteractions(friendId, limit = 50) {
    // 查询与指定朋友相关的所有互动记录
    const sql = `
          SELECT * FROM blocks 
          WHERE path LIKE '/Interactions/%' 
          AND attr ->> 'friend-id' = '${friendId}'
          ORDER BY created DESC 
          LIMIT ${limit}
      `;

    return await this.querySQL(sql);
  }

  generateFriendDocument(friendData) {
    return `# ${friendData.name}

alias: ${JSON.stringify(friendData.nickname ? [friendData.nickname] : [])}
birthday: ${friendData.birthday || ''}
met-date: ${friendData.metDate}
met-location: ${friendData.metLocation || ''}
relationship: ${friendData.relationship}
tags: ${JSON.stringify(friendData.tags || [])}
contact-phone: ${friendData.contact?.phone || ''}
contact-wechat: ${friendData.contact?.wechat || ''}
contact-email: ${friendData.contact?.email || ''}
intimacy: ${friendData.intimacyLevel || 5}

## 基本信息

**姓名**: ${friendData.name}
**昵称**: ${friendData.nickname || ''}
**认识时间**: ${friendData.metDate}
**认识地点**: ${friendData.metLocation || ''}
**关系**: ${friendData.relationship}
**亲密度**: ${'⭐'.repeat(friendData.intimacyLevel || 5)}${'☆'.repeat(10 - (friendData.intimacyLevel || 5))}

## 联系方式

- **电话**: ${friendData.contact?.phone || ''}
- **微信**: ${friendData.contact?.wechat || ''}
- **邮箱**: ${friendData.contact?.email || ''}
- **社交媒体**: ${friendData.contact?.socialMedia || ''}

## 个人备注

${friendData.notes || ''}

## 互动记录

{{SELECT * FROM blocks WHERE path LIKE '/Interactions/%' AND attr ->> 'friend-id' = '${await this.generateFriendId(friendData.name)}' ORDER BY created DESC}}

## 财务记录

{{SELECT * FROM blocks WHERE path LIKE '/Financial/%' AND attr ->> 'friend-id' = '${await this.generateFriendId(friendData.name)}' ORDER BY created DESC}}
`;
  }

  async setFriendAttributes(blockId, friendData) {
    const attributes = {
      'friend-id': await this.generateFriendId(friendData.name),
      'friend-name': friendData.name,
      'friend-nickname': friendData.nickname || '',
      'friend-birthday': friendData.birthday || '',
      'friend-met-date': friendData.metDate,
      'friend-met-location': friendData.metLocation || '',
      'friend-relationship': friendData.relationship,
      'friend-tags': JSON.stringify(friendData.tags || []),
      'friend-intimacy': friendData.intimacyLevel || 5,
      'friend-contact-phone': friendData.contact?.phone || '',
      'friend-contact-wechat': friendData.contact?.wechat || '',
      'friend-contact-email': friendData.contact?.email || '',
      'friend-last-contact': friendData.lastContactDate || ''
    };

    // 使用思源API设置属性
    await this.setBlockAttrs(blockId, attributes);
  }

  async parseFriendFromBlock(block) {
    const attrs = block.attributes || {};

    return {
      id: block.id,
      name: attrs['friend-name'] || block.content,
      nickname: attrs['friend-nickname'],
      birthday: attrs['friend-birthday'],
      metDate: attrs['friend-met-date'],
      metLocation: attrs['friend-met-location'],
      relationship: attrs['friend-relationship'],
      tags: JSON.parse(attrs['friend-tags'] || '[]'),
      intimacyLevel: parseInt(attrs['friend-intimacy']) || 5,
      contact: {
        phone: attrs['friend-contact-phone'],
        wechat: attrs['friend-contact-wechat'],
        email: attrs['friend-contact-email']
      },
      lastContactDate: attrs['friend-last-contact'],
      created: block.created,
      updated: block.updated
    };
  }

  async generateFriendId(name) {
    // 生成唯一的朋友ID
    return 'friend-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }

  // 思源API封装方法
  async querySQL(sql) {
    return await window.siyuan.querySQL(sql);
  }

  async createDocument(path, content) {
    return await window.siyuan.createDocument(path, content);
  }

  async setBlockAttrs(blockId, attrs) {
    return await window.siyuan.setBlockAttrs(blockId, attrs);
  }
}