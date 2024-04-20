import Store from "../models/stores.model.js";

const isShopActive = async (req, res, next) => {

  const { shop, host } = req.query;

  console.log("Shop in isShopActive" , shop)
  console.log("Host in isShopActive" , host)

  if (!shop) {
    next();
    return;
  }

  console.log("isShopActive line no" , 15)

  const isShopAvaialble = await Store.findOne({where : {shop : shop}})

  if (isShopAvaialble === null || !isShopAvaialble.isActive) {

    if (isShopAvaialble === null) {

      await Store.create({
        shop :  shop ,
        isActive : false
      })

    } else if (!isShopAvaialble.isActive) {

      await Store.update(
        {
          isActive : false
        },
        {
          where : {shop : shop},
          limit : 1
        }
      )
      // await Store.findOneAndUpdate({ shop }, { isActive: false });
    }
    
    res.redirect(`/auth?shop=${shop}&host=${host}`);
  } else {
    next();
  }
};

export default isShopActive;
