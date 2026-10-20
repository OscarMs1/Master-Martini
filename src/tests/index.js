// Import every application module so untested modules remain in the denominator.
const modules=require.context('../',true,/\.(js|jsx)$/);
modules.keys().filter(key=>!key.startsWith('./tests/')&&key!=='./main.jsx').forEach(modules);
const specs=require.context('./',false,/\.spec\.jsx$/);specs.keys().forEach(specs);
