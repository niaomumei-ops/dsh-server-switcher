window.__ModuleLoader__.load({
	id: "dsh-server-switcher",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		const SERVERS = [
			{ key: "yecao", name: "野草云", url: "https://yecao.dsh.xmbot.top/", icon: "🌿", defaultTheme: "green" },
			{ key: "ali",    name: "阿里云",   url: "https://ali.dsh.xmbot.top/",  icon: "☁️", defaultTheme: "purple" },
			{ key: "pc",     name: "PC 电脑", url: "https://dsh.xmbot.top/",      icon: "💻", defaultTheme: "blue" }
		];

		const THEMES = {
			white:  { name: "白", bg: "#f8f8f8", accent: "#e5e7eb" },
			green:  { name: "绿", bg: "#eef9f2", accent: "#6ee7b7" },
			blue:   { name: "蓝", bg: "#eef2fb", accent: "#60a5fa" },
			purple: { name: "紫", bg: "#f4eeff", accent: "#a78bfa" },
			red:    { name: "红", bg: "#fdeeee", accent: "#fca5a5" }
		};

		const THEME_ORDER = ["white", "green", "blue", "purple", "red"];

		// 全局主题 API 地址（认证服务）
		const API_URL = "https://dsh.xmbot.top/api/theme";

		function currentServer() {
			const h = location.hostname;
			if (h.includes("ali.")) return "ali";
			if (h === "dsh.xmbot.top") return "pc";
			return "yecao";
		}

		// ── 全局皮肤读写（统一 API）──
		function fetchTheme() {
			return fetch(API_URL).then(r => r.text()).then(t => t.trim()).catch(() => "");
		}
		function pushTheme(key) {
			return fetch(API_URL, { method: "POST", body: key }).catch(() => {});
		}

		// ── 整页背景 ──
		function applyTheme(key) {
			const t = THEMES[key] || THEMES.blue;
			let el = document.getElementById("dsh-sw-bg");
			if (!el) {
				el = document.createElement("style");
				el.id = "dsh-sw-bg";
				document.head.appendChild(el);
			}
			el.textContent = `
				body, body[data-ds-dark-theme] {
					--dsw-alias-bg-base: ${t.bg} !important;
					--dsw-alias-bg-layer-1: ${t.bg} !important;
					--dsw-alias-bg-layer-2: ${t.bg} !important;
					--dsw-alias-bg-overlay: ${t.bg} !important;
					--dsw-specific-sidebar-fill: ${t.bg} !important;
					--dsw-specific-workspace-fill: ${t.bg} !important;
					--dsh-boot-bg: ${t.bg} !important;
					background: ${t.bg} !important;
				}
			`;
		}

		function mount() {
			if (!document.body) { setTimeout(mount, 100); return; }
			if (document.getElementById("dsh-sw-wrap")) return;

			const cur = currentServer();
			let expanded = false;
			// 默认皮肤先应用，随后异步拉取全局值覆盖
			let currentKey = SERVERS.find(s => s.key === cur).defaultTheme;
			applyTheme(currentKey);

			// ── 拉取全域皮肤 ──
			fetchTheme().then(global => {
				if (global && THEMES[global]) {
					currentKey = global;
					applyTheme(global);
					updateDotHighlight(global);
				}
			});

			// ── 样式 ──
			const style = document.createElement("style");
			style.id = "dsh-sw-css";
			style.textContent = `
				#dsh-sw-wrap {
					position: fixed; top: 10px; left: 50%; transform: translateX(-50%);
					z-index: 99999;
					font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif;
					display: flex; flex-direction: row; align-items: center; gap: 6px;
				}
				#dsh-sw-eye {
					width: 30px; height: 30px; border-radius: 50%;
					background: rgba(13,20,40,.85); backdrop-filter: blur(10px);
					border: 1px solid rgba(99,130,255,.3);
					cursor: pointer; display: flex; align-items: center; justify-content: center;
					font-size: 15px; color: #8fa3c8;
					transition: all .2s; user-select: none;
					box-shadow: 0 4px 16px rgba(0,0,0,.3); flex-shrink: 0;
				}
				#dsh-sw-eye:hover { border-color: #6366f1; color: #eaf0ff; }
				#dsh-sw-eye.open { color: #a78bfa; border-color: #a78bfa; }
				#dsh-sw-panel {
					display: none; flex-direction: row; align-items: center; gap: 8px;
					background: rgba(13,20,40,.92); backdrop-filter: blur(16px);
					border: 1px solid rgba(99,130,255,.3); border-radius: 14px;
					padding: 6px 10px;
					box-shadow: 0 8px 28px rgba(0,0,0,.45);
					white-space: nowrap;
				}
				#dsh-sw-panel.show { display: flex; }
				.sw-link {
					display: inline-flex; align-items: center; gap: 3px;
					color: #eaf0ff; text-decoration: none;
					font-size: 12px; font-weight: 500;
					padding: 4px 8px; border-radius: 8px;
					transition: all .15s; cursor: pointer;
				}
				.sw-link:hover { background: rgba(99,102,241,.25); }
				.sw-link.active {
					background: rgba(16,185,129,.2);
					border: 1px solid rgba(16,185,129,.5);
					box-shadow: 0 0 8px rgba(16,185,129,.3);
					color: #6ee7b7;
					cursor: default; pointer-events: none;
				}
				.sw-div { width: 1px; height: 20px; background: rgba(99,130,255,.2); flex-shrink: 0; }
				.sw-dot {
					width: 16px; height: 16px; border-radius: 50%;
					cursor: pointer; border: 2px solid transparent;
					transition: all .15s; flex-shrink: 0;
					position: relative;
				}
				.sw-dot:hover { transform: scale(1.3); }
				.sw-dot.on {
					border-color: #fff;
					transform: scale(1.35);
					box-shadow: 0 0 0 2px rgba(255,255,255,.7), 0 0 10px rgba(255,255,255,.5);
				}
				.sw-dot.on::after {
					content: "✓"; position: absolute;
					top: 50%; left: 50%; transform: translate(-50%, -50%);
					font-size: 10px; font-weight: 900; color: #fff;
					text-shadow: 0 1px 2px rgba(0,0,0,.5);
				}
				.sw-restart {
					display: inline-flex; align-items: center; gap: 4px;
					font-size: 11px; font-weight: 500;
					color: #fca5a5; background: rgba(239,68,68,.1);
					border: 1px solid rgba(239,68,68,.25); border-radius: 6px;
					padding: 4px 10px; cursor: pointer; transition: all .15s;
				}
				.sw-restart:hover { background: rgba(239,68,68,.25); color: #fff; }
				@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
				.sw-restart:hover .sw-ico { animation: spin 0.8s linear; }
				.sw-ico { font-size: 13px; }
			`;
			document.head.appendChild(style);

			// ── HTML ──
			const wrap = document.createElement("div");
			wrap.id = "dsh-sw-wrap";

			const eye = document.createElement("div");
			eye.id = "dsh-sw-eye";
			eye.title = "切换服务器";
			eye.textContent = "👁";

			const panel = document.createElement("div");
			panel.id = "dsh-sw-panel";

			const srvHTML = SERVERS.map(s => {
				const a = s.key === cur;
				return `<a href="${s.url}" class="sw-link${a ? " active" : ""}"${a ? ' aria-disabled="true"' : ""}>${s.icon} ${s.name}</a>`;
			}).join("");

			const dotHTML = THEME_ORDER.map(k => {
				const t = THEMES[k];
				return `<div class="sw-dot${k === currentKey ? " on" : ""}" data-theme="${k}" style="background:${t.accent}" title="${t.name}"></div>`;
			}).join("");

			panel.innerHTML = srvHTML
				+ '<div class="sw-div"></div>'
				+ dotHTML
				+ '<div class="sw-div"></div>'
				+ '<button class="sw-restart" id="dsh-sw-restart" title="重启 DSH 服务"><span class="sw-ico">⏻</span> 重启</button>';

			wrap.appendChild(eye);
			wrap.appendChild(panel);
			document.body.appendChild(wrap);

			// 更新色点高亮
			function updateDotHighlight(key) {
				panel.querySelectorAll(".sw-dot").forEach(d => {
					d.classList.toggle("on", d.dataset.theme === key);
				});
			}
			window.__dshUpdateDotHighlight = updateDotHighlight;

			// ── 交互 ──
			eye.addEventListener("click", e => {
				e.stopPropagation();
				expanded = !expanded;
				panel.classList.toggle("show", expanded);
				eye.classList.toggle("open", expanded);
				eye.textContent = expanded ? "👁‍🗨" : "👁";
			});
			document.addEventListener("click", e => {
				if (!wrap.contains(e.target) && expanded) {
					expanded = false;
					panel.classList.remove("show");
					eye.classList.remove("open");
					eye.textContent = "👁";
				}
			});

			// 皮肤点击 → 全局写入
			panel.querySelectorAll(".sw-dot").forEach(dot => {
				dot.addEventListener("click", e => {
					e.stopPropagation();
					const k = dot.dataset.theme;
					currentKey = k;
					applyTheme(k);
					pushTheme(k); // 推送全局
					updateDotHighlight(k);
				});
			});

			document.getElementById("dsh-sw-restart").addEventListener("click", e => {
				e.stopPropagation();
				if (!confirm("确定重启 DSH 服务？\n所有对话会话将中断。")) return;
				fetch("/api/restart", { method: "POST" }).catch(() => {})
					.finally(() => setTimeout(() => location.reload(), 2000));
			});
		}

		function apply(ctx) { mount(); }
		exports.apply = apply;
		exports.inject = ["slots"];
		return module.exports;
	}
});
