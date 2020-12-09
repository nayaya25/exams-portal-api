const { PORT } = require("./helpers/constants");
const app = require("./loader");
const router = require("./routes");

app.use(router) 

app.listen(PORT, () => {
    console.log(`Server Started at Port: ${PORT}`)
})
