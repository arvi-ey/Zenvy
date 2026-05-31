import bcrypt from "bcrypt";



export const generateHash = async (val: string) => {
    const hashedval = await bcrypt.hash(
        val,
        10
    );
    return hashedval
}

export const compareHash = async (hashedval: string, rawval: string) => {
    const isMatch = await bcrypt.compare(rawval, hashedval);
    return isMatch

}