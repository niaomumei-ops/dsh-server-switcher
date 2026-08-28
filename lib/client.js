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
			blue:   { name: "蓝", bg: "#f0f4ff", accent: "#60a5fa" },
			purple: { name: "紫", bg: "#f8f0ff", accent: "#a78bfa" },
			gray:   { name: "灰", bg: "#f7f8fa", accent: "#9ca3af" },
			white:  { name: "白", bg: "#fafafa", accent: "#e5e7eb" },
			green:  { name: "绿", bg: "#f0faf5", accent: "#6ee7b7" },
			red:    { name: "红", bg: "#fef5f5", accent: "#fca5a5" }
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

		// ── 整页背景皮肤 ── 用 background 短属性强制覆盖 ──
		function applyTheme(key) {
			const t = THEMES[key] || THEMES.blue;
			let el = document.getElementById("dsh-sw-bg");
			if (!el) {
				el = document.createElement("style");
				el.id = "dsh-sw-bg";
				document.head.appendChild(el);
			}
			// 覆盖 body + root + 所有可能的容器，用 background 短属性覆盖 background 和 background-color
			el.textContent = `
				html, body {
					background: ${t.bg} !important;
				}
				#root, #root > *, #root > * > *, #root > * > * > * {
					background: ${t.bg} !important;
				}
				/* 覆盖 DSH CSS 变量 */
				:root {
					--dsw-specific-bg-primary: ${t.bg} !important;
					--dsw-alias-bg-primary: ${t.bg} !important;
					--dsw-alias-background-primary: ${t.bg} !important;
					--dsw-alias-surface-fill: ${t.bg} !important;
					--dsw-specific-sidebar-fill: ${t.bg} !important;
					--dsw-specific-workspace-fill: ${t.bg} !important;
				}
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
				.sw-div { width: 1px; height: 20px; background: rgba(99,130,255,.2); flex-shrink: 0; }
				.sw-dot {
					width: 16px; height: 16px; border-radius: 50%;
					cursor: pointer; border: 2px solid transparent;
					transition: all .15s; flex-shrink: 0;
				}
				.sw-dot:hover { transform: scale(1.3); }
				.sw-dot.on { border-color: #fff; box-shadow: 0 0 4px rgba(255,255,255,.5); }
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

			const dotHTML = Object.entries(THEMES).map(([k, t]) =>
				`<div class="sw-dot${k === currentKey ? " on" : ""}" data-theme="${k}" style="background:${t.accent}" title="${t.name}"></div>`
			).join("");

			panel.innerHTML = srvHTML
				+ '<div class="sw-div"></div>'
				+ dotHTML
				+ '<div class="sw-div"></div>'
				+ '<button class="sw-restart" id="dsh-sw-restart" title="重启 DSH 服务"><span class="sw-ico">⏻</span> 重启</button>';

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
