import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";

import { getAllPosts, getAuthorBySlug } from "../services/api";

export default function Posts({ posts }) {
  return (
    <>
      <Header />
      <div className="margin-vertical-large margin-sides-medium">
        <div className="max-width margin-auto">
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
              <>
                <Head>
                  <title>Home | Rafael Bizao</title>
                  <meta name="description" content="Dicas de Python, Flask, ReactJS, DevOps, GCP e desenvolvimento web no geral" />
                  <meta name="keywords" content="python, flask, reactjs, react, devops, gcp, web, web development, deploy, ci, cd" />
                  <meta httpEquiv="content-language" content="pt-br, en-US" />
                  <meta httpEquiv="content-type" content="text/html; charset=UTF-8" />
                </Head>
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
              </>
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
