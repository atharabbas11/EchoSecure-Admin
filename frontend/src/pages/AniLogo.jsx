import logo from "../images/eslogo.png"; 

const AnimatedLogo = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white">
        <div className="flex space-x-10">
            <div className="flex flex-col items-center">
            <div className="animate-pulse">
                <img src={logo} alt="Logo" width={130} height={130} />
            </div>
            <p className="text-lg font-semibold">
                EchoSecure<span className="dot-animation"></span>
            </p>
            </div>
        </div>
    </div>
  );
};

export default AnimatedLogo;
