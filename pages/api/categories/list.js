import main from "../../../database/conn";
import Category from "../../../model/categorySchema";

const list = async (req, res) => {
  try {
    await main();

    const categories = await Category.find({})
      .lean()
      .sort({ updatedAt: -1 });

    const getCategories = (data, parentId = null) => {
      return data
        .filter((item) => {
          if (parentId === null) {
            return item.parent_id == null;
          }

          return (
            item.parent_id &&
            item.parent_id.toString() === parentId.toString()
          );
        })
        .map((item) => ({
          ...item,  
          children: getCategories(data, item._id),
        }));
    };

    const result = getCategories(categories);

    return res.status(200).json(result);
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      error: "Server Error",
    });
  }
};

export default list;