import fs from 'fs';
import path from 'path';
import simpleGit from 'simple-git';

const reposRoot = path.join(process.cwd(), 'repos');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export class GitService {
  constructor(root = reposRoot) {
    this.root = root;
    ensureDir(this.root);
  }

  getRepoPath(projectId) {
    return path.join(this.root, projectId.toString());
  }

  async ensureRepo(projectId) {
    const repoPath = this.getRepoPath(projectId);
    ensureDir(repoPath);
    const git = simpleGit(repoPath);
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      await git.init();
      // 초기 커밋 준비
      fs.writeFileSync(path.join(repoPath, '.gitkeep'), '');
      await git.add('.');
      await git.commit('chore: init repo');
    }
    return repoPath;
  }

  async addAndCommit(projectId, sourceFilePath, destRelativePath, message, author = {}) {
    const repoPath = await this.ensureRepo(projectId);
    const git = simpleGit(repoPath);

    const destPath = path.join(repoPath, destRelativePath);
    ensureDir(path.dirname(destPath));
    fs.copyFileSync(sourceFilePath, destPath);

    await git.add(destRelativePath);
    const commit = await git.commit(message, destRelativePath, {
      '--author': `${author.name || 'unknown'} <${author.email || 'unknown@example.com'}>`
    });

    const log = await git.log({ n: 1 });
    return { commitId: log.latest.hash, repoPath };
  }

  async checkout(projectId, commitId) {
    const repoPath = this.getRepoPath(projectId);
    const git = simpleGit(repoPath);
    await git.checkout(commitId);
    return repoPath;
  }
}

