import "./Home.css";
import Button from "@mui/material/Button";

export const Home = () => {
    return (
        <div className="Home">
            <div className="pageContainer">
                <div className="intro">
                    <div className="title">P2P Chat</div>
                    <span className="description">A Website For One-on-One Videochats</span>
                </div>
                <div className="invite">
                    <Button variant="contained" color="primary" onClick={() =>  window.location.href='/webchat'}>
                        Start Session
                    </Button>
                </div>
            </div>
        </div>
    );
}