import { useSearchParams } from "react-router-dom"
const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("v")

    return (
        <div>VerifyEmail</div>
    )
}

export default VerifyEmail