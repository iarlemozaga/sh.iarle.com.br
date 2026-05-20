const GITHUB_USER = "iarlemozaga";
const GITLAB_USER = "iarlemozaga";

document.addEventListener("DOMContentLoaded", () => {
  setupReveal();
  loadGithubRepos();
  loadGitlabRepos();
});

function setupReveal() {
  const elements = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        } else {
          entry.target.classList.remove("visible");
        }
      });
    },
    {
      threshold: 0.22,
      rootMargin: "0px 0px -10% 0px",
    },
  );

  elements.forEach((element) => {
    observer.observe(element);
  });
}

async function loadGithubRepos() {
  const grid = document.querySelector("#github-grid");

  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`,
    );

    if (!response.ok) throw new Error();

    const repos = await response.json();

    const filtered = repos.filter((repo) => !repo.fork).slice(0, 8);

    renderRepos(grid, filtered, "github");
  } catch {
    grid.innerHTML = `<p class="muted">failed loading github repositories</p>`;
  }
}

async function loadGitlabRepos() {
  const grid = document.querySelector("#gitlab-grid");

  try {
    const userResponse = await fetch(
      `https://gitlab.com/api/v4/users?username=${GITLAB_USER}`,
    );

    if (!userResponse.ok) throw new Error();

    const users = await userResponse.json();
    const user = users[0];

    if (!user) throw new Error();

    const reposResponse = await fetch(
      `https://gitlab.com/api/v4/users/${user.id}/projects?per_page=100&order_by=last_activity_at&sort=desc`,
    );

    if (!reposResponse.ok) throw new Error();

    const repos = await reposResponse.json();

    renderRepos(grid, repos.slice(0, 8), "gitlab");
  } catch {
    grid.innerHTML = `<p class="muted">failed loading gitlab repositories</p>`;
  }
}

function renderRepos(container, repos, source) {
  if (!repos.length) {
    container.innerHTML = `<p class="muted">no public repositories found</p>`;
    return;
  }

  container.innerHTML = repos
    .map((repo) => {
      const url = source === "github" ? repo.html_url : repo.web_url;
      const stars =
        source === "github" ? repo.stargazers_count : repo.star_count;
      const updated =
        source === "github" ? repo.updated_at : repo.last_activity_at;

      return `
            <article class="repo-card reveal">
                <div class="repo-name">
                    <a href="${url}" target="_blank" rel="noopener">
                        ${escapeHtml(repo.name)}
                    </a>
                </div>

                <div class="repo-desc">
                    ${escapeHtml(repo.description || "sem descrição pública.")}
                </div>

                <div class="repo-meta">
                    <span>★ ${stars}</span>
                    <span>${formatDate(updated)}</span>
                </div>
            </article>
        `;
    })
    .join("");

  setupReveal();
}

function formatDate(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
