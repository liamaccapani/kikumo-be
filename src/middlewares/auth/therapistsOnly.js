import createHttpError from "http-errors"

export const therapistsOnly = async (req, res, next) => {
    if(req.user.role === "Therapist"){
        next() 
    }else{
        next(createHttpError(403, "therapists only :["))
    }
}