const { PORT } = require("./helpers/constants");
const app = require("./loader");

app.listen(PORT, () => {
  console.log(`Server Started at Port: ${PORT}`);
});
