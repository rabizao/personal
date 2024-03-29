import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getAllAuthors() {
  const authorsDirectory = path.join(process.cwd(), "_authors");
  const filenames = fs.readdirSync(authorsDirectory);

  return filenames.map((filename) => {
    const file = fs.readFileSync(
      path.join(process.cwd(), "_authors", filename),
      "utf8"
    );

    // get data
    const data = JSON.parse(file);

    // get slug from filename
    const slug = filename.replace(/\.json/, "");

    // return combined frontmatter and slug; build permalink
    return {
      ...data,
      permalink: `/authors/${slug}`,
      profilePictureUrl: `/images/${slug}.webp`,
      slug,
    };
  });
}

export function getAllPosts() {
  const postsDirectory = path.join(process.cwd(), "_posts");
  const filenames = fs.readdirSync(postsDirectory);

  return filenames.map((filename) => {
    const file = fs.readFileSync(
      path.join(process.cwd(), "_posts", filename),
      "utf8"
    );

    // get frontmatter
    const { data } = matter(file);

    // get slug from filename
    const slug = filename.replace(/\.md$/, "");

    // return combined frontmatter and slug; build permalink
    return {
      ...data,
      permalink: `/${slug}`,
      slug,
    };
  });
}

export function getAuthorBySlug(slug) {
  const file = fs.readFileSync(
    path.join(process.cwd(), "_authors", `${slug}.json`),
    "utf8"
  );

  const data = JSON.parse(file);

  return {
    ...data,
    permalink: `/authors/${slug}`,
    profilePictureUrl: `/images/${slug}.webp`,
    slug,
  };
}

export function getPostBySlug(slug) {
  const file = fs.readFileSync(
    path.join(process.cwd(), "_posts", `${slug}.md`),
    "utf8"
  );

  const { content, data } = matter(file);

  const body = remark().use(html).processSync(content).toString();

  return {
    ...data,
    body,
    slug,
  };
}
