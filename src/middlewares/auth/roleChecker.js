import createHttpError from "http-errors"

export const therapistsOnly = async (req, res, next) => {
    if(req.user.role === "Therapist"){
        next() 
    }else{
        next(createHttpError(403, "You shall not pass!"))
    }
}

export const clientsOnly = async (req, res, next) => {
    if(req.user.role === "Client"){
        next() 
    }else{
        next(createHttpError(403, "You shall not pass!"))
    }
}