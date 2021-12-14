import { GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Prismic from '@prismicio/client';

import { CalendarIcon, UserIcon } from '../assets/icons';
import { getPrismicClient } from '../services/prismic';
import { formatDate } from '../utils';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home(props: HomeProps) {
  const { postsPagination } = props;

  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function loadMorePosts() {
    if (nextPage) {
      const response = await fetch(nextPage);
      const { next_page, results } = (await response.json()) as PostPagination;

      const postsResponse = results.map(
        ({ uid, first_publication_date, data }) => ({
          uid,
          first_publication_date: formatDate(new Date(first_publication_date)),
          data,
        })
      );

      setNextPage(next_page);
      setPosts(prevState => [...prevState, ...postsResponse]);
    }
  }

  useEffect(() => {
    setPosts(prevState => {
      return prevState.map(({ uid, first_publication_date, data }) => ({
        uid,
        first_publication_date: formatDate(new Date(first_publication_date)),
        data,
      }));
    });
  }, []);

  return (
    <main className={commonStyles.container}>
      <header className={styles.header}>
        <Image src="/assets/logo.svg" alt="logo" width={240} height={26} />
      </header>

      <section>
        {posts.map(
          ({
            uid,
            first_publication_date,
            data: { author, title, subtitle },
          }) => (
            <div key={uid} className={styles.post}>
              <Link href={`/post/${uid}`} passHref>
                <a className={styles.postHeader}>
                  <strong>{title}</strong>
                  <p>{subtitle}</p>
                </a>
              </Link>

              <div className={styles.postFooter}>
                <div className={styles.postFooterContent}>
                  <CalendarIcon />
                  <time>{first_publication_date}</time>
                </div>

                <div className={styles.postFooterContent}>
                  <UserIcon />
                  <span>{author}</span>
                </div>
              </div>
            </div>
          )
        )}
      </section>

      {nextPage && (
        <button
          onClick={loadMorePosts}
          className={styles.buttonLink}
          type="button"
        >
          Carregar mais posts
        </button>
      )}
    </main>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.slug', 'posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 1,
    }
  );

  const { next_page } = postsResponse;

  const results = postsResponse.results.map(
    ({ uid, first_publication_date, data }) => ({
      uid,
      first_publication_date,
      data,
    })
  );

  return {
    props: {
      postsPagination: {
        next_page,
        results,
      },
    },
  };
};
