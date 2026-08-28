window.__ModuleLoader__.load({
	id: "dsh-server-switcher",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		// ── 服务器配置（含背景色） ──
		const SERVERS = [
			{ key: "yecao", name: "野草云", url: "https://yecao.dsh.xmbot.top/", icon: "🌿", theme: "#e8f5e9", accent: "#4caf50", label: "淡雅绿" },
			{ key: "pc",     name: "PC 电脑", url: "https://dsh.xmbot.top/",      icon: "💻", theme: "#e3f2fd", accent: "#2196f3", label: "淡雅蓝" },
			{ key: "ali",    name: "阿里云",   url: "https://ali.dsh.xmbot.top/",  icon: "☁️", theme: "#f3e5f5", accent: "#9c27b0", label: "淡雅紫" }
		];

		// ── 可选背景风格 ──
		const THEMES = [
			{ name: "淡雅蓝", color: "#e3f2fd", accent: "#2196f3" },
			{ name: "淡雅紫", color: "#f3e5f5", accent: "#9c27b0" },
			{ name: "淡雅灰", color: "#f5f5f5", accent: "#9e9e9e" },
			{ name: "淡雅白", color: "#ffffff", accent: "#e0e0e0" },
			{ name: "淡雅绿", color: "#e8f5e9", accent: "#4caf50" },
			{ name: "淡雅红", color: "#fce4ec", accent: "#e91e63" }
		];

		function currentServer() {
			const h = location.hostname;
			if (h.includes("ali.")) return "ali";
			if (h === "dsh.xmbot.top") return "pc";
			return "yecao";
		}

		// ── 背景风格应用 ──
		function applyTheme(theme) {
			let bg = document.getElementById("dsh-sw-theme");
			if (!bg) {
				bg = document.createElement("style");
				bg.id = "dsh-sw-theme";
				document.head.appendChild(bg);
			}
			bg.textContent = `
				body, #app, #root, [class*="root"], [class*="app"] {
					background-color: ${theme.color} !important;
				}
			`;
			// 保存选择
			try { localStorage.setItem("dsh-sw-theme", JSON.stringify(theme)); } catch(e) {}
		}

		// ── 恢复已保存的主题 ──
		function restoreTheme() {
			try {
				const saved = localStorage.getItem("dsh-sw-theme");
				if (saved) {
					applyTheme(JSON.parse(saved));
					return JSON.parse(saved);
				}
			} catch(e) {}
			// 默认：根据当前服务器
			const cur = currentServer();
			const srv = SERVERS.find(s => s.key === cur) || SERVERS[0];
			const def = { name: srv.label, color: srv.theme, accent: srv.accent };
			applyTheme(def);
			return def;
		}

		function mount() {
			if (!document.body) { setTimeout(mount, 100); return; }
			if (document.getElementById("dsh-sw-wrap")) return;

			const cur = currentServer();
			let expanded = false;
			let currentTheme = restoreTheme();

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
					width: 32px; height: 32px;
					border-radius: 50%;
					background: rgba(13,20,40,.85); backdrop-filter: blur(10px);
					border: 1px solid rgba(99,130,255,.3);
					cursor: pointer; display: flex; align-items: center; justify-content: center;
					font-size: 16px; color: #8fa3c8;
					transition: all .2s; user-select: none;
					box-shadow: 0 4px 16px rgba(0,0,0,.3);
					flex-shrink: 0;
				}
				#dsh-sw-eye:hover { border-color: #6366f1; color: #eaf0ff; }
				#dsh-sw-eye.open  { color: #a78bfa; border-color: #a78bfa; }
				#dsh-sw-panel {
					display: none;
					background: rgba(13,20,40,.92); backdrop-filter: blur(16px);
					border: 1px solid rgba(99,130,255,.3); border-radius: 14px;
					padding: 8px;
					box-shadow: 0 8px 28px rgba(0,0,0,.45);
					gap: 4px;
					white-space: nowrap;
					flex-direction: column;
				}
				#dsh-sw-panel.show { display: flex; }
				/* 行：服务器链接 */
				#dsh-sw-servers {
					display: flex; flex-direction: row; gap: 4px;
				}
				#dsh-sw-servers .sw-link {
					display: inline-flex; align-items: center; gap: 4px;
					color: #eaf0ff; text-decoration: none;
					font-size: 12px; font-weight: 500;
					padding: 5px 10px; border-radius: 8px;
					transition: all .15s;
				}
				#dsh-sw-servers .sw-link:hover { background: rgba(99,102,241,.25); }
				#dsh-sw-servers .sw-link.active {
					background: rgba(99,102,241,.18);
					border: 1px solid rgba(99,130,255,.35);
					opacity: .55; cursor: default; pointer-events: none;
				}
				/* 分隔线 */
				.dsh-sw-sep {
					height: 1px; background: rgba(99,130,255,.15); margin: 4px 0;
				}
				/* 背景风格选择 */
				#dsh-sw-themes {
					display: flex; flex-direction: row; gap: 4px; align-items: center;
				}
				#dsh-sw-themes .sw-theme-dot {
					width: 20px; height: 20px; border-radius: 50%;
					cursor: pointer; border: 2px solid transparent;
					transition: all .15s;
				}
				#dsh-sw-themes .sw-theme-dot:hover { transform: scale(1.2); }
				#dsh-sw-themes .sw-theme-dot.active { border-color: #eaf0ff; box-shadow: 0 0 6px rgba(255,255,255,.4); }
				#dsh-sw-themes .sw-theme-label {
					font-size: 10px; color: #8fa3c8; margin-left: 4px;
				}
				/* 按钮行 */
				#dsh-sw-btns {
					display: flex; flex-direction: row; gap: 4px;
				}
				.sw-btn {
					font-size: 11px; color: #8fa3c8; background: rgba(99,102,241,.1);
					border: 1px solid rgba(99,130,255,.2); border-radius: 6px;
					padding: 4px 10px; cursor: pointer;
					transition: all .15s;
				}
				.sw-btn:hover { background: rgba(99,102,241,.25); color: #eaf0ff; }
			`;
			document.head.appendChild(style);

			// ── 构建 HTML ──
			const wrap = document.createElement("div");
			wrap.id = "dsh-sw-wrap";

			// 眼睛按钮
			const eye = document.createElement("div");
			eye.id = "dsh-sw-eye";
			eye.title = "切换服务器";
			eye.textContent = "👁";

			// 面板
			const panel = document.createElement("div");
			panel.id = "dsh-sw-panel";

			// 行1：服务器链接
			const srvRow = document.createElement("div");
			srvRow.id = "dsh-sw-servers";
			srvRow.innerHTML = SERVERS.map(s => {
				const active = s.key === cur;
				return `<a href="${s.url}" class="sw-link${active ? " active" : ""}"${
					active ? ' aria-disabled="true"' : ""
				}>${s.icon} ${s.name}${active ? " (当前)" : ""}</a>`;
			}).join("");

			// 分隔线
			const sep1 = document.createElement("div");
			sep1.className = "dsh-sw-sep";

			// 行2：背景风格色点
			const themeRow = document.createElement("div");
			themeRow.id = "dsh-sw-themes";
			themeRow.innerHTML = THEMES.map((t, i) => {
				const active = currentTheme.name === t.name;
				return `<div class="sw-theme-dot${active ? " active" : ""}" data-idx="${i}" style="background:${t.accent}" title="${t.name}"></div>`;
			}).join("") + `<span class="sw-theme-label">${currentTheme.name}</span>`;

			// 分隔线
			const sep2 = document.createElement("div");
			sep2.className = "dsh-sw-sep";

			// 行3：按钮（重启）
			const btnRow = document.createElement("div");
			btnRow.id = "dsh-sw-btns";
			btnRow.innerHTML = `<button class="sw-btn" id="dsh-sw-restart">🔄 重启服务</button>`;

			panel.appendChild(srvRow);
			panel.appendChild(sep1);
			panel.appendChild(themeRow);
			panel.appendChild(sep2);
			panel.appendChild(btnRow);

			wrap.appendChild(eye);
			wrap.appendChild(panel);
			document.body.appendChild(wrap);

			// ── 交互 ──
			// 点击眼睛
			eye.addEventListener("click", (e) => {
				e.stopPropagation();
				expanded = !expanded;
				panel.classList.toggle("show", expanded);
				eye.classList.toggle("open", expanded);
				eye.textContent = expanded ? "👁‍🗨" : "👁";
			});

			// 点击其他地方收起
			document.addEventListener("click", (e) => {
				if (!wrap.contains(e.target) && expanded) {
					expanded = false;
					panel.classList.remove("show");
					eye.classList.remove("open");
					eye.textContent = "👁";
				}
			});

			// 背景风格点击
			themeRow.querySelectorAll(".sw-theme-dot").forEach(dot => {
				dot.addEventListener("click", (e) => {
					e.stopPropagation();
					const idx = parseInt(dot.dataset.idx);
					const t = THEMES[idx];
					applyTheme(t);
					currentTheme = t;
					// 更新高亮
					themeRow.querySelectorAll(".sw-theme-dot").forEach(d => d.classList.remove("active"));
					dot.classList.add("active");
					themeRow.querySelector(".sw-theme-label").textContent = t.name;
				});
			});

			// 重启按钮
			document.getElementById("dsh-sw-restart").addEventListener("click", (e) => {
				e.stopPropagation();
				if (confirm("确定重启 DSH 服务？")) {
					// 通过 DSH 的内部刷新（硬刷新页面）
					location.reload();
				}
			});
		}

		function apply(ctx) { mount(); }

		exports.apply = apply;
		exports.inject = ["slots"];
		return module.exports;
	}
});
