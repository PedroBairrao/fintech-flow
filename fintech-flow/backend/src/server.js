import app from "./app.js";

const port = process.env.PORT || 3333;
app.listen(port, () => console.log(`API em http://localhost:${port} | docs em /api/docs`));
