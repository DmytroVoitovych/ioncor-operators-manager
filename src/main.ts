import type { UserModule } from "./types";
import { ViteSSG } from "vite-ssg";
import "~/styles/index.scss";
import { routes } from "vue-router/auto-routes";
import App from "./App.vue";

// If you want to use ElMessage, import it.
import "element-plus/theme-chalk/src/message.scss";
import "element-plus/theme-chalk/src/message-box.scss";
import "element-plus/theme-chalk/src/notification.scss";


export const createApp = ViteSSG(
  App,
  {
    routes,
    base: import.meta.env.BASE_URL,
  },
  (ctx) => {
    // install all modules under `modules/`
    Object.values(
      import.meta.glob<{ install: UserModule }>("./modules/*.ts", { eager: true }),
    ).forEach((i) => i.install?.(ctx));
    // ctx.app.use(Previewer)
  },
);
