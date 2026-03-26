import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

/**
 * Web root HTML. Popunder script from Adsterra / network (insert before closing </body>).
 * @see adsterra.txt
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />
      </head>
      <body>
        {children}
        <script
          async
          src="https://pl28951061.profitablecpmratenetwork.com/45/02/20/4502205103ed25db71eb6aa696f1338f.js"
        />
        <script src="https://pl28951127.profitablecpmratenetwork.com/a5/45/ed/a545ed1c032c47d7589394be5fef97c0.js" />
      </body>
    </html>
  );
}
