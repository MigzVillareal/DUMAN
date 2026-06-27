function PageHeader({ title, subtitle, action, children, className = "" }) {
  return (
    <section className={`page-header${className ? ` ${className}` : ""}`}>
      <div className="page-header__content">
        <h1 className="page-header__title">{title}</h1>
        {subtitle ? <p className="page-header__subtitle">{subtitle}</p> : null}
        {children}
      </div>
      {action ? <div className="page-header__action">{action}</div> : null}
    </section>
  );
}

export default PageHeader;
