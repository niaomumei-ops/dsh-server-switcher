window.__ModuleLoader__.load({
	id: "dsh-server-switcher",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		const SERVERS = [
			{ key: "yecao", name: "野草云", url: "https://yecao.dsh.xmbot.top/", icon: "🌿" },
			{ key: "pc",     name: "PC 电脑", url: "https://dsh.xmbot.top/",          icon: "💻" },
			{ key: "ali",    name: "阿里云",   url: "https://ali.dsh.xmbot.top/",      icon: "☁️" }
		];

		function currentServer() {
			const h = location.hostname;
			if (h.includes("ali.")) return "ali";
			if (h === "dsh.xmbot.top") return "pc";
			return "yecao";
		}

		function mount() {
			if (!document.body) { setTimeout(mount, 100); return; }
			if (document.getElementById("dsh-sw-wrap")) return;

			const cur = currentServer();
			let expanded = false;

			// --- 样式 ---
			const style = document.createElement("style");
			style.id = "dsh-sw-css";
			style.textContent = `
				#dsh-sw-wrap {
					position: fixed; top: 10px; left: 50%; transform: translateX(-50%);
					z-index: 99999;
					font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif;
					display: flex; flex-direction: row; align-items: center; gap: 6px;
				}
				/* 小眼睛按钮 */
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
				/* 服务器链接面板 */
				#dsh-sw-panel {
					display: none;
					background: rgba(13,20,40,.92); backdrop-filter: blur(16px);
					border: 1px solid rgba(99,130,255,.3); border-radius: 12px;
					padding: 6px 8px;
					box-shadow: 0 8px 28px rgba(0,0,0,.45);
					gap: 4px;
					white-space: nowrap;
				}
				#dsh-sw-panel.show { display: flex; }
				#dsh-sw-panel .sw-link {
					display: inline-flex; align-items: center; gap: 4px;
					color: #eaf0ff; text-decoration: none;
					font-size: 12px; font-weight: 500;
					padding: 5px 10px; border-radius: 8px;
					transition: all .15s;
				}
				#dsh-sw-panel .sw-link:hover { background: rgba(99,102,241,.25); }
				#dsh-sw-panel .sw-link.active {
					background: rgba(99,102,241,.18);
					border: 1px solid rgba(99,130,255,.35);
					opacity: .55; cursor: default; pointer-events: none;
				}
				/* 更新提示红点 */
				#dsh-sw-update {
					display: none;
					position: absolute; top: -4px; right: -4px;
					width: 10px; height: 10px;
					background: #ef4444; border-radius: 50%;
					border: 2px solid rgba(13,20,40,.85);
				}
				#dsh-sw-update.show { display: block; }
			`;
			document.head.appendChild(style);

			// --- HTML ---
			const wrap = document.createElement("div");
			wrap.id = "dsh-sw-wrap";

			// 眼睛按钮（带更新红点）
			const eye = document.createElement("div");
			eye.id = "dsh-sw-eye";
			eye.title = "切换服务器";
			eye.style.position = "relative";
			eye.textContent = "👁";

			const updateDot = document.createElement("div");
			updateDot.id = "dsh-sw-update";
			eye.appendChild(updateDot);

			// 服务器链接面板（眼睛右侧）
			const panel = document.createElement("div");
			panel.id = "dsh-sw-panel";
			panel.innerHTML = SERVERS.map(s => {
				const active = s.key === cur;
				return `<a href="${s.url}" class="sw-link${active ? " active" : ""}"${
					active ? ' aria-disabled="true"' : ""
				}>${s.icon} ${s.name}${active ? " (当前)" : ""}</a>`;
			}).join("");

			wrap.appendChild(eye);
			wrap.appendChild(panel);
			document.body.appendChild(wrap);

			// --- 交互：点击小眼睛 ---
			eye.addEventListener("click", (e) => {
				e.stopPropagation();
				expanded = !expanded;
				panel.classList.toggle("show", expanded);
				eye.classList.toggle("open", expanded);
				eye.childNodes[0].textContent = expanded ? "👁‍🗨" : "👁";
			});

			// 点击其他地方收起
			document.addEventListener("click", (e) => {
				if (!wrap.contains(e.target) && expanded) {
					expanded = false;
					panel.classList.remove("show");
					eye.classList.remove("open");
					eye.childNodes[0].textContent = "👁";
				}
			});

			// --- 版本检查（可选：检查 GitHub 最新版本）---
			// 注意：此功能需要跨域请求 GitHub，可能被浏览器阻止
			// 如果需要版本检查，建议通过 DSH host 端实现
		}

		function apply(ctx) { mount(); }

		exports.apply = apply;
		exports.inject = ["slots"];
		return module.exports;
	}
});
