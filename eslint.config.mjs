import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  
   
  ...compat.extends("next/core-web-vitals", ),
   
  {
    rules: {



 
    "react-hooks/exhaustive-deps": "off", 

     
      "react/no-unescaped-entities": "off",

      
      "@next/next/no-page-custom-font": "off",

    
      "@next/next/no-img-element": "off",

      // ✅ Allow prop spreading (optional)
      "react/jsx-props-no-spreading": "off",

      // ✅ Allow devDependencies in all files (useful for config/test files)
      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: true,
        },
      ],

      // ✅ Avoid unused variables (auto-ignore those starting with `_`)
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],

      // ✅ Allow any in some cases (not strict, but prevents build failure)
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default eslintConfig;
