const DownloadButton = () => {
  return (
    <div className="flex justify-center space-x-4">
      <a
        href="https://play.google.com/store/apps/details?id=com.devindeed.bloomsplash"
        target="_blank"
        rel="noopener noreferrer"
        className="transition-all duration-300 transform hover:translate-y-[-4px] "
      >
        <img
          src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
          alt="Get it on Google Play"
          className="h-16 md:h-24"
          style={{ filter: "drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))" }}
        />
      </a>
    </div>
  );
};

export default DownloadButton;
