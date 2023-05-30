import { ProductsManager } from "../dao/index.js";
import { productsModel}  from "../dao/models/products.model.js";
import {authDao} from "../dao/factory.js";
import {productService} from "../repository/index.js";
import {generateProducts} from "../utils.js";
import {CustomError} from "../services/curstomError.service.js";
import {Errors} from "../enums/Errors.js";
import {generateUserErrorInfo} from "../services/userErrorInfo.js";
import {generateUserErrorParam} from "../services/userErrorParams.js";


const productsManager = new ProductsManager(productsModel);

export const mockController = (req, res) => {
    try {
        const cant = parseInt(req.query.cant) || 100; //vamos a generar 100 usuarios
    
        let products = [];
    
        for(let i=0; i<cant; i++) { //para que genere la cant de usuarios que le pedi
            const product = generateProducts();
            products.push(product);
        };
        res.json({products});
    } catch (err) {
        res.status(404).send({status: "success", error: `${err}`})
    }
};

export const getProductController = async  (req, res) => {
    try {
        const products = await productService.getProducts(); //esto deberia devolverme todos los productos
        res.json({status: "success", payload: products }); //payload hace referencia al resultado de la peticion
    } catch (error) {
        res.json({status:"error", message: error.message});
    }
};

export const getProductIdController = async (req, res)=>{
    try {
        const product = await productService.getProduct(req.params.id);
        res.json({status: "success", payload: product}); //payload hace referencia al resultado de la peticion
    } catch (error) {
        res.json({status:"error", message: error.message});
    }
};

export const createProductController = async (req, res) => {
    const {title, description, price, stock } = req.body;

    if(!title || !description || !price  ||!stock ){
        CustomError.createError({ //todos estos items que agregamos son los que creamos en el customError.service
            name: "User create error",
            cause: generateUserErrorInfo(req.body), //eso lo creamos es userErrorInfo.js
            message: "Error creando el usuario",
            errorCode:Errors.INVALID_JSON  //los que creamos en el EEror.js
    })};

    const result = await productsManager.create({
        title,
        description,
        price,
        stock,
    });

    res.status(201).send({ status: "ok", payload: result});
};

export const updateProductController = async (req, res) =>{
    try{
        const {pid} = req.params
        const id = parseInt(pid)
        await manager.updatedProducts(id, req.body)

        const products = await productsManager.getProducts()
        req.io.emit("update-product", products)
    
        res.send({status: "succes", payload: await productsManager.getProductById(id)})
    }catch(err){
        res.status(404).send({status: "error", error: `${err}`})
    }
};

export const deleteProductController = async(req, res)=>{
    try{
        const {pid} = req.params;
        const id = parseInt(pid);
        await productsManager.deleteProduct(id, req.body);

        const products = await productsManager.getProducts()
        req.io.emit("delete-product", products)

        res.send({status: "succes", payload: "Producto eliminado"})
    } catch(err){
        res.status(404).send({status: "error", error: `${err}`})
    }
}