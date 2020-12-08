const app = require("./loader")
require("dotenv").config()

app.get('/', (req, res) => {
    res.send("Hello Duniya") 
}) 

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server Started at Port: ${port}`)
})
