const SiteFooter = ({ className = '' }) => (
  <footer className={`site-footer ${className}`.trim()}>
    <span>© {new Date().getFullYear()} Project18 Europe · By young European founders, for young European founders</span>
    <a href="mailto:partnerships@project18.eu">Sponsors: partnerships@project18.eu</a>
  </footer>
);

export default SiteFooter;
