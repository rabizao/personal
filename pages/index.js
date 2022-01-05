import Image from "next/image";
import Link from "next/link";

import { getAllPosts, getAuthorBySlug } from "../services/api";

export default function Posts({ posts }) {
  return (
    <>
      <div className="padding-large background-primary">
        <span className="size-xxlarge bold color-secondary">Rafael Bizão</span>
        <p className="color-secondary size-smaller lighter">rabizao@gmail.com</p>
        <p className="color-secondary lighter">Dicas de Python, Flask, ReactJS, Deploy, GCP e desenvolvimento web no geral</p>
      </div>
      <div className="flex flex-center margin-vertical-large margin-sides-medium">
        <div className="max-width">
          {posts.map((post) => {
            const prettyDate = new Date(post.createdAt).toLocaleString(
              "en-US",
              {
                month: "short",
                day: "2-digit",
                year: "numeric",
              }
            );

            return (
              <article key={post.slug} className="margin-bottom-medium">
                <h2 className="size-xxlarge bold">{post.title}</h2>

                <div className="flex-row flex-axis-center margin-bottom-small">
                  <Image
                    className="radius-rounded"
                    alt={post.author.name}
                    src={post.author.profilePictureUrl}
                    height="40"
                    width="40"
                  />

                  <div className="margin-left-xsmall">
                    <strong>{post.author.name}</strong> -
                    <time dateTime={post.createdAt}> {prettyDate}.</time>
                  </div>
                </div>

                <p>{post.excerpt}</p>
                <Link href={post.permalink}>
                  <a>Read more →</a>
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}

export function getStaticProps() {
  return {
    props: {
      posts: getAllPosts()
        .map((post) => ({
          ...post,
          author: getAuthorBySlug(post.author),
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    },
  };
}
