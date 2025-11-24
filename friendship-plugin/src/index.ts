class FriendshipPlugin {
    constructor() {
        this.i18n = {};
        this.friendManager = new FriendManager();
        this.interactionLogger = new InteractionLogger();
        this.reminderSystem = new ReminderSystem();
    }

    async onload() {
        // 加载国际化
        await this.loadI18n();

        // 注册插件图标
        this.addIcon();

        // 初始化服务
        await this.friendManager.init();
        await this.interactionLogger.init();
        await this.reminderSystem.init();

        // 创建UI组件
        this.createPanel();
        this.registerCommands();

        console.log('Friendship Plugin loaded');
    }

    onunload() {
        this.destroyPanel();
        console.log('Friendship Plugin unloaded');
    }

    async loadI18n() {
        const lang = window.siyuan.config.lang;
        try {
            const response = await fetch(`/plugins/friendship-recorder/i18n/${lang}.json`);
            this.i18n = await response.json();
        } catch (error) {
            // 默认使用中文
            this.i18n = {
                "friendManagement": "朋友管理",
                "addFriend": "添加朋友",
                "searchFriends": "搜索朋友...",
                "quickRecord": "快速记录",
                "upcomingReminders": "即将提醒",
                "analytics": "数据分析",
                "name": "姓名",
                "relationship": "关系",
                "birthday": "生日",
                "contact": "联系方式"
            };
        }
    }

    addIcon() {
        // 添加朋友关系图标到思源
        const iconSvg = `<svg viewBox="0 0 32 32">
            <path d="M16 0c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16-7.163-16-16-16zM16 30c-7.732 0-14-6.268-14-14s6.268-14 14-14 14 6.268 14 14-6.268 14-14 14zM22 10c0-3.314-2.686-6-6-6s-6 2.686-6 6 2.686 6 6 6 6-2.686 6-6zM10 10c0-2.209 1.791-4 4-4s4 1.791 4 4-1.791 4-4 4-4-1.791-4-4zM26 28c0-1.105-0.895-2-2-2h-16c-1.105 0-2 0.895-2 2v2h20v-2zM8 26h16c0.552 0 1 0.448 1 1v1h-18v-1c0-0.552 0.448-1 1-1z"/>
        </svg>`;

        // 这里需要根据思源API注册图标
        // window.siyuan.addIcon('friend', iconSvg);
    }

    createPanel() {
        // 创建右侧边栏面板
        this.panel = new FriendshipPanel(this);
        this.panel.create();
    }

    destroyPanel() {
        if (this.panel) {
            this.panel.destroy();
        }
    }

    registerCommands() {
        // 注册插件命令
        const commands = [
            {
                langKey: 'quickRecord',
                langText: this.i18n.quickRecord,
                hotkey: 'Ctrl+Shift+R',
                callback: () => this.panel.showQuickRecord()
            },
            {
                langKey: 'addFriend',
                langText: this.i18n.addFriend,
                hotkey: 'Ctrl+Shift+F',
                callback: () => this.panel.showAddFriend()
            }
        ];

        commands.forEach(cmd => {
            // 使用思源API注册命令
            // window.siyuan.addCommand(cmd);
        });
    }
}

// 插件注册
if (typeof window !== 'undefined') {
    window.friendshipPlugin = new FriendshipPlugin();
}