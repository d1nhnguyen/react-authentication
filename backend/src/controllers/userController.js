export const authMe = async (req, res) => {
    try {
        const user = req.user;

        return res.status(200).json({
            user
        })
    } catch (error) {
        console.log("Failed in authMe");
        return res.status(500).json({message: "System failed"});
    }
}