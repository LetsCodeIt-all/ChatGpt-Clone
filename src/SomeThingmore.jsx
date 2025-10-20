import React, { useEffect, useState } from "react";
import "./SomeThingmore.scss";
import NotesIcon from "@mui/icons-material/Notes";
import CreateIcon from "@mui/icons-material/Create";
import SchoolIcon from "@mui/icons-material/School";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import TipsAndUpdatesOutlinedIcon from "@mui/icons-material/TipsAndUpdatesOutlined";
import CardGiftcardRoundedIcon from "@mui/icons-material/CardGiftcardRounded";
import BarChartTwoToneIcon from "@mui/icons-material/BarChartTwoTone";

function SomeThingmore() {
  const [showAll, setShowAll] = useState(false);
  const [buttons, setButtons] = useState([]);

  const Icons = {
    NotesIcon,
    CreateIcon,
    SchoolIcon,
    RemoveRedEyeOutlinedIcon,
    TipsAndUpdatesOutlinedIcon,
    CardGiftcardRoundedIcon,
    BarChartTwoToneIcon,
  };

  function DynamicIcon({ iconName, color }) {
    const IconComponent = Icons[iconName];
    if (!IconComponent) return null;
    return <IconComponent sx={{ color }} fontSize="small" />;
  }

  function BtnCreater({ name, iconName, color, onClick }) {
    return (
      <button className="BtnJi" onClick={onClick}>
        <DynamicIcon iconName={iconName} color={color} />
        <p>{name}</p>
      </button>
    );
  }

  const btnConfigs = [
    { name: "Summarize text", iconName: "NotesIcon", color: "orange" },
    { name: "Help me Write", iconName: "CreateIcon", color: "purple" },
    { name: "Get Advice", iconName: "SchoolIcon", color: "aqua" },
    {
      name: "Analyze images",
      iconName: "RemoveRedEyeOutlinedIcon",
      color: "navy",
    },
    {
      name: "BrainStorm",
      iconName: "TipsAndUpdatesOutlinedIcon",
      color: "yellow",
    },
    { name: "Surprise me", iconName: "CardGiftcardRoundedIcon", color: "aqua" },
    {
      name: "Make a Plan",
      iconName: "TipsAndUpdatesOutlinedIcon",
      color: "yellow",
    },
    { name: "Analyze data", iconName: "BarChartTwoToneIcon", color: "aqua" },
  ];

  useEffect(() => {
    const shuffled = [...btnConfigs].sort(() => Math.random() - 0.5);
    setButtons(showAll ? shuffled : shuffled.slice(0, 3));
  }, [showAll]);

  function handleMoreClick() {
    setShowAll(true);
  }

  return (
    <div
      className="BoxWithBtns"
      style={{
        display: "flex",

        height: "100%",
        flexWrap: "wrap",
        width: "70%",
        justifyContent: "center",
      }}
    >
      {buttons.map((btn, index) => (
        <BtnCreater key={index} {...btn} />
      ))}

      {!showAll && <BtnCreater name="More" onClick={handleMoreClick} />}
    </div>
  );
}

export default SomeThingmore;
