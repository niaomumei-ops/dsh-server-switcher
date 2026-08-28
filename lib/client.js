window.__ModuleLoader__.load({
	id: "dsh-server-switcher",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		// ── 服务器配置 ──
		const SERVERS = [
			{ key: "yecao", name: "野草云", url: "https://yecao.dsh.xmbot.top/", icon: "🌿", defaultTheme: "green" },
			{ key: "pc",     name: "PC 电脑", url: "https://dsh.xmbot.top/",      icon: "💻", defaultTheme: "blue" },
			{ key: "ali",    name: "阿里云",   url: "https://ali.dsh.xmbot.top/",  icon: "☁️", defaultTheme: "purple" }
		];

		// ── 6种淡雅皮肤 ──
		const THEMES = {
			blue:   { name: "淡雅蓝", bg: "#edf2fb", accent: "#3b82f6", text: "#1e3a5f", bar: "rgba(59,130,246,.08)" },
			purple: { name: "淡雅紫", bg: "#f3e8ff", accent: "#8b5cf6", text: "#4c1d95", bar: "rgba(139,92,246,.08)" },
			gray:   { name: "淡雅灰", bg: "#f3f4f6", accent: "#6b7280", text: "#1f2937", bar: "rgba(107,114,128,.08)" },
			white:  { name: "淡雅白", bg: "#ffffff", accent: "#d1d5db", text: "#111827", bar: "rgba(209,213,219,.06)" },
			green:  { name: "淡雅绿", bg: "#ecfdf5", accent: "#10b981", text: "#064e3b", bar: "rgba(16,185,129,.08)" },
			red:    { name: "淡雅红", bg: "#fef2f2", accent: "#ef4444", text: "#7f1d1d", bar: "rgba(239,68,68,.08)" }
		};

		function currentServer() {
			const h = location.hostname;
			if (h.includes("ali.")) return "ali";
			if (h === "dsh.xmbot.top") return "pc";
			return "yecao";
		}

		// ── 读取/保存皮肤设置 ──
		function loadSkinSettings() {
			try {
				const s = localStorage.getItem("dsh-sw-skins");
				return s ? JSON.parse(s) : {};
			} catch(e) { return {}; }
		}
		function saveSkinSettings(skins) {
			try { localStorage.setItem("dsh-sw-skins", JSON.stringify(skins)); } catch(e) {}
		}

		// ── 应用皮肤 ──
		function applyTheme(themeKey) {
			const t = THEMES[themeKey] || THEMES.blue;
			let el = document.getElementById("dsh-sw-theme-css");
			if (!el) {
				el = document.createElement("style");
				el.id = "dsh-sw-theme-css";
				document.head.appendChild(el);
			}
			el.textContent = `
				body { background: ${t.bg} !important; }
				#dsh-sw-wrap .sw-link { color: ${t.text}; }
				#dsh-sw-wrap .sw-link:hover { background: ${t.accent}22; }
				#dsh-sw-wrap .sw-link.active { border-color: ${t.accent}66; }
				#dsh-sw-panel { border-color: ${t.accent}33; }
				#dsh-sw-eye { border-color: ${t.accent}55; }
				#dsh-sw-eye:hover, #dsh-sw-eye.open { border-color: ${t.accent}; color: ${t.accent}; }
				.sw-theme-dot.active { box-shadow: 0 0 0 2px ${t.bg}, 0 0 0 4px ${t.accent} !important; }
			`;
		}

		function mount() {
			if (!document.body) { setTimeout(mount, 100); return; }
			if (document.getElementById("dsh-sw-wrap")) return;

			const cur = currentServer();
			const skins = loadSkinSettings();
			let expanded = false;
			let currentThemeKey = skins[cur] || SERVERS.find(s => s.key === cur).defaultTheme;

			// 应用初始皮肤
			applyTheme(currentThemeKey);

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
					width: 32px; height: 32px; border-radius: 50%;
					background: rgba(13,20,40,.85); backdrop-filter: blur(10px);
					border: 1px solid rgba(99,130,255,.3);
					cursor: pointer; display: flex; align-items: center; justify-content: center;
					font-size: 16px; color: #8fa3c8;
					transition: all .2s; user-select: none;
					box-shadow: 0 4px 16px rgba(0,0,0,.3); flex-shrink: 0;
				}
				#dsh-sw-eye:hover { border-color: #6366f1; color: #eaf0ff; }
				#dsh-sw-eye.open  { color: #a78bfa; border-color: #a78bfa; }
				#dsh-sw-panel {
					display: none; flex-direction: column; gap: 6px;
					background: rgba(13,20,40,.92); backdrop-filter: blur(16px);
					border: 1px solid rgba(99,130,255,.3); border-radius: 14px;
					padding: 10px 12px;
					box-shadow: 0 8px 28px rgba(0,0,0,.45);
					white-space: nowrap; min-width: 260px;
				}
				#dsh-sw-panel.show { display: flex; }
				.dsh-sw-row { display: flex; flex-direction: row; gap: 4px; align-items: center; }
				.dsh-sw-label { font-size: 10px; color: #6b7fa8; min-width: 36px; }
				.dsh-sw-sep { height: 1px; background: rgba(99,130,255,.12); margin: 2px 0; }
				.sw-link {
					display: inline-flex; align-items: center; gap: 4px;
					color: #eaf0ff; text-decoration: none;
					font-size: 12px; font-weight: 500;
					padding: 5px 10px; border-radius: 8px;
					transition: all .15s; cursor: pointer;
				}
				.sw-link:hover { background: rgba(99,102,241,.25); }
				.sw-link.active {
					background: rgba(99,102,241,.18);
					border: 1px solid rgba(99,130,255,.35);
					opacity: .6; cursor: default; pointer-events: none;
				}
				.sw-theme-dot {
					width: 18px; height: 18px; border-radius: 50%;
					cursor: pointer; border: 2px solid transparent;
					transition: all .15s; flex-shrink: 0;
				}
				.sw-theme-dot:hover { transform: scale(1.25); }
				.sw-theme-dot.active { border-color: #eaf0ff; box-shadow: 0 0 6px rgba(255,255,255,.4); }
				.sw-btn {
					font-size: 11px; color: #8fa3c8; background: rgba(99,102,241,.1);
					border: 1px solid rgba(99,130,255,.2); border-radius: 6px;
					padding: 4px 10px; cursor: pointer; transition: all .15s;
				}
				.sw-btn:hover { background: rgba(99,102,241,.25); color: #eaf0ff; }
			`;
			document.head.appendChild(style);

			// ── 构建 HTML ──
			const wrap = document.createElement("div");
			wrap.id = "dsh-sw-wrap";

			const eye = document.createElement("div");
			eye.id = "dsh-sw-eye";
			eye.title = "切换服务器";
			eye.textContent = "👁";

			const panel = document.createElement("div");
			panel.id = "dsh-sw-panel";

			// 行1: 服务器切换
			const srvRow = document.createElement("div");
			srvRow.className = "dsh-sw-row";
			srvRow.innerHTML = '<span class="dsh-sw-label">服务器</span>' + SERVERS.map(s => {
				const active = s.key === cur;
				return `<a href="${s.url}" class="sw-link${active ? " active" : ""}"${active ? ' aria-disabled="true"' : ""}>${s.icon} ${s.name}${active ? " (当前)" : ""}</a>`;
			}).join("");

			// 行2: 皮肤选择
			const themeRow = document.createElement("div");
			themeRow.className = "dsh-sw-row";
			const themeDots = Object.entries(THEMES).map(([key, t]) => {
				const active = key === currentThemeKey;
				return `<div class="sw-theme-dot${active ? " active" : ""}" data-theme="${key}" style="background:${t.accent}" title="${t.name}"></div>`;
			}).join("");
			themeRow.innerHTML = `<span class="dsh-sw-label">皮肤</span>${themeDots}`;

			// 行3: 操作按钮
			const btnRow = document.createElement("div");
			btnRow.className = "dsh-sw-row";
			btnRow.innerHTML = `
				<button class="sw-btn" id="dsh-sw-restart" title="重启当前 DSH 服务">🔄 重启</button>
				<button class="sw-btn" id="dsh-sw-refresh" title="刷新当前页面">🔃 刷新</button>
			`;

			panel.appendChild(srvRow);
			const sep1 = document.createElement("div");
			sep1.className = "dsh-sw-sep";
			panel.appendChild(sep1);
			panel.appendChild(themeRow);
			const sep2 = document.createElement("div");
			sep2.className = "dsh-sw-sep";
			panel.appendChild(sep2);
			panel.appendChild(btnRow);

			wrap.appendChild(eye);
			wrap.appendChild(panel);
			document.body.appendChild(wrap);

			// ── 交互：眼睛展开/收起 ──
			eye.addEventListener("click", (e) => {
				e.stopPropagation();
				expanded = !expanded;
				panel.classList.toggle("show", expanded);
				eye.classList.toggle("open", expanded);
				eye.textContent = expanded ? "👁‍🗨" : "👁";
			});
			document.addEventListener("click", (e) => {
				if (!wrap.contains(e.target) && expanded) {
					expanded = false;
					panel.classList.remove("show");
					eye.classList.remove("open");
					eye.textContent = "👁";
				}
			});

			// ── 皮肤切换 ──
			themeRow.querySelectorAll(".sw-theme-dot").forEach(dot => {
				dot.addEventListener("click", (e) => {
					e.stopPropagation();
					const key = dot.dataset.theme;
					currentThemeKey = key;
					applyTheme(key);
					// 保存：每个服务器独立皮肤
					skins[cur] = key;
					saveSkinSettings(skins);
					// 更新高亮
					themeRow.querySelectorAll(".sw-theme-dot").forEach(d => d.classList.remove("active"));
					dot.classList.add("active");
				});
			});

			// ── 重启按钮 ──
			document.getElementById("dsh-sw-restart").addEventListener("click", (e) => {
				e.stopPropagation();
				if (!confirm("确定重启当前 DSH 服务？")) return;
				// 尝试通过 DSH API 重启（如果可用），否则刷新
				fetch("/api/restart", { method: "POST" }).catch(() => {}).finally(() => {
					setTimeout(() => location.reload(), 1500);
				});
			});

			// ── 刷新按钮 ──
			document.getElementById("dsh-sw-refresh").addEventListener("click", (e) => {
				e.stopPropagation();
				location.reload();
			});
		}

		function apply(ctx) { mount(); }
		exports.apply = apply;
		exports.inject = ["slots"];
		return module.exports;
	}
});
