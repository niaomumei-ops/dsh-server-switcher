window.__ModuleLoader__.load({
	id: "dsh-server-switcher",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		const SERVERS = [
			{ key: "yecao", name: "野草云", url: "https://yecao.dsh.xmbot.top/", icon: "🌿", defaultTheme: "green" },
			{ key: "pc",     name: "PC 电脑", url: "https://dsh.xmbot.top/",      icon: "💻", defaultTheme: "blue" },
			{ key: "ali",    name: "阿里云",   url: "https://ali.dsh.xmbot.top/",  icon: "☁️", defaultTheme: "purple" }
		];

		const THEMES = {
			blue:   { name: "蓝", bg: "#edf2fb", accent: "#3b82f6" },
			purple: { name: "紫", bg: "#f3e8ff", accent: "#8b5cf6" },
			gray:   { name: "灰", bg: "#f3f4f6", accent: "#6b7280" },
			white:  { name: "白", bg: "#ffffff", accent: "#d1d5db" },
			green:  { name: "绿", bg: "#ecfdf5", accent: "#10b981" },
			red:    { name: "红", bg: "#fef2f2", accent: "#ef4444" }
		};

		function currentServer() {
			const h = location.hostname;
			if (h.includes("ali.")) return "ali";
			if (h === "dsh.xmbot.top") return "pc";
			return "yecao";
		}

		function loadSkins() {
			try { return JSON.parse(localStorage.getItem("dsh-sw-skins") || "{}"); } catch(e) { return {}; }
		}
		function saveSkins(s) { try { localStorage.setItem("dsh-sw-skins", JSON.stringify(s)); } catch(e) {} }

		// ── 整页背景皮肤 ──
		function applyTheme(key) {
			const t = THEMES[key] || THEMES.blue;
			let el = document.getElementById("dsh-sw-bg");
			if (!el) {
				el = document.createElement("style");
				el.id = "dsh-sw-bg";
				document.head.appendChild(el);
			}
			el.textContent = `
				html, body { background: ${t.bg} !important; }
				/* 插件元素跟随皮肤色 */
				#dsh-sw-eye:hover, #dsh-sw-eye.open { border-color: ${t.accent}; color: ${t.accent}; }
				.sw-theme-dot[active] { box-shadow: 0 0 0 2px #fff, 0 0 0 3px ${t.accent}; }
			`;
		}

		function mount() {
			if (!document.body) { setTimeout(mount, 100); return; }
			if (document.getElementById("dsh-sw-wrap")) return;

			const cur = currentServer();
			const skins = loadSkins();
			let expanded = false;
			let currentKey = skins[cur] || SERVERS.find(s => s.key === cur).defaultTheme;
			applyTheme(currentKey);

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
					background: rgba(99,102,241,.18);
					border: 1px solid rgba(99,130,255,.35);
					opacity: .6; cursor: default; pointer-events: none;
				}
				.sw-divider { width: 1px; height: 20px; background: rgba(99,130,255,.2); flex-shrink: 0; }
				.sw-dot {
					width: 16px; height: 16px; border-radius: 50%;
					cursor: pointer; border: 2px solid transparent;
					transition: all .15s; flex-shrink: 0;
				}
				.sw-dot:hover { transform: scale(1.3); }
				.sw-dot.on { border-color: #fff; box-shadow: 0 0 4px rgba(255,255,255,.5); }
				.sw-btn {
					font-size: 11px; color: #8fa3c8; background: rgba(99,102,241,.1);
					border: 1px solid rgba(99,130,255,.2); border-radius: 6px;
					padding: 4px 8px; cursor: pointer; transition: all .15s;
					white-space: nowrap;
				}
				.sw-btn:hover { background: rgba(99,102,241,.25); color: #eaf0ff; }
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

			// 服务器链接
			const srvHTML = SERVERS.map(s => {
				const a = s.key === cur;
				return `<a href="${s.url}" class="sw-link${a ? " active" : ""}"${a ? ' aria-disabled="true"' : ""}>${s.icon} ${s.name}</a>`;
			}).join("");

			// 皮肤色点
			const dotHTML = Object.entries(THEMES).map(([k, t]) =>
				`<div class="sw-dot${k === currentKey ? " on" : ""}" data-theme="${k}" style="background:${t.accent}" title="${t.name}"></div>`
			).join("");

			panel.innerHTML = srvHTML
				+ '<div class="sw-divider"></div>'
				+ dotHTML
				+ '<div class="sw-divider"></div>'
				+ '<button class="sw-btn" id="dsh-sw-restart" title="重启 DSH">🔄</button>'
				+ '<button class="sw-btn" id="dsh-sw-refresh" title="刷新页面">🔃</button>';

			wrap.appendChild(eye);
			wrap.appendChild(panel);
			document.body.appendChild(wrap);

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

			// 皮肤点击
			panel.querySelectorAll(".sw-dot").forEach(dot => {
				dot.addEventListener("click", e => {
					e.stopPropagation();
					const k = dot.dataset.theme;
					currentKey = k;
					applyTheme(k);
					skins[cur] = k;
					saveSkins(skins);
					panel.querySelectorAll(".sw-dot").forEach(d => d.classList.remove("on"));
					dot.classList.add("on");
				});
			});

			// 重启
			document.getElementById("dsh-sw-restart").addEventListener("click", e => {
				e.stopPropagation();
				if (!confirm("重启 DSH 服务？")) return;
				fetch("/api/restart", { method: "POST" }).catch(() => {}).finally(() => {
					setTimeout(() => location.reload(), 1500);
				});
			});

			// 刷新
			document.getElementById("dsh-sw-refresh").addEventListener("click", e => {
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
