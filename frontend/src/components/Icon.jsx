const ICONS = {
  bell: "fa-bell",
  "location-dot": "fa-location-dot",
  user: "fa-user",
  search: "fa-magnifying-glass",
  plus: "fa-plus",
  "chevron-down": "fa-chevron-down",
};

export default function Icon({ icon, size = "md", expanded, className = "" }) {
  const faIcon = ICONS[icon];
  if (!faIcon) return null;

  const classes = ["fa-solid", faIcon, "app-icon", `app-icon--${size}`, className]
    .filter(Boolean)
    .join(" ");

  if (icon === "chevron-down" && expanded !== undefined) {
    return (
      <span
        className={`app-icon-chevron${expanded ? " app-icon-chevron--expanded" : ""}`}
      >
        <i className={classes} aria-hidden="true" />
      </span>
    );
  }

  return <i className={classes} aria-hidden="true" />;
}
