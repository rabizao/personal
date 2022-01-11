import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";

import {
  getAllPosts,
  getAuthorBySlug,
  getPostBySlug,
} from "../services/api";

export default function Post({ post }) {
  const prettyDate = new Date(post.createdAt).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  return (
    <>
      <Head>
        <title>{post.title} | Rafael Bizao</title>
        <meta name="description" content={post.excerpt} />
        <meta name="keywords" content={post.keywords} />
        <meta httpEquiv="content-language" content={post.language} />
        <meta httpEquiv="content-type" content="text/html; charset=UTF-8" />
      </Head>
      <Header />
      <div className="margin-vertical-large margin-sides-medium">
        <div className="max-width margin-auto">
          <Link href="/">
            <a>← Home</a>
          </Link>

          <h1 className="size-xxlarge bold">{post.title}</h1>

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

          <div dangerouslySetInnerHTML={{ __html: post.body }} />

          <Link href="/">
            <a>← Home</a>
          </Link>

        </div>
      </div>
    </>
  );
}

export function getStaticProps({ params }) {
  const post = getPostBySlug(params.slug);
  const author = getAuthorBySlug(post.author);

  return {
    props: {
      post: {
        ...post,
        author,
      },
    },
  };
}

export function getStaticPaths() {
  return {
    fallback: false,
    paths: getAllPosts().map((post) => ({
      params: {
        slug: post.slug,
      },
    })),
  };
}
