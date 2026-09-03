/**
 * What to say when Vercel tells us nothing.
 *
 * Running locally, none of the VERCEL_* variables are set. On a deployment
 * created by uploading files rather than from a Git connection — which is how
 * the portal provisions an app — `VERCEL_ENV` is set but the `VERCEL_GIT_*`
 * variables are not. Reporting "local" in that case is simply wrong, so the two
 * cases get different words.
 */
const NOT_DEPLOYED = "local";
const NO_GIT_METADATA = "uploaded";

export default function Home() {
  const deployed = Boolean(process.env.VERCEL_ENV);
  const unknown = deployed ? NO_GIT_METADATA : NOT_DEPLOYED;
  const branch = process.env.VERCEL_GIT_COMMIT_REF || unknown;
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || unknown;
  const env = process.env.VERCEL_ENV || NOT_DEPLOYED;

  return (
    <main className="page">
      <h1 className="title">Hello World</h1>
      <p className="subtitle">Served by glass-ui-app1</p>

      <footer className="deployment">
        <span className="deployment-label">deployment:</span>
        <span className="deployment-value" title="Vercel environment">
          {env}
        </span>
        <span className="deployment-sep">·</span>
        <span className="deployment-value" title="Git branch">
          {branch}
        </span>
        <span className="deployment-sep">·</span>
        <span className="deployment-value" title="Git commit">
          {sha}
        </span>
      </footer>
    </main>
  );
}
