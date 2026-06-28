import main from "../../../database/conn";
import Slider from "../../../model/sliderSchema";

export default async function handler(req, res) {
  await main();
  const sliders = await Slider.find().sort({ order: 1 });
  res.status(200).json(sliders);
}
