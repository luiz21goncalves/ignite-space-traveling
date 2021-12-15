import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import shortid from 'shortid';

import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';
import { formatDate } from '../../utils';
import { CalendarIcon, ClockIcon, UserIcon } from '../../assets/icons';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post(props: PostProps) {
  const { post } = props;

  const router = useRouter();

  if (router.isFallback) {
    return (
      <>
        <Header />
        <main className={commonStyles.container}>
          <p>Carregando...</p>
        </main>
      </>
    );
  }

  const readTime = post.data.content.reduce((accumulator, currentValue) => {
    const content = `${currentValue.heading} ${RichText.asText(
      currentValue.body
    )}`;

    const words = content.trim().split(/\s+/).length;
    const AVERAGE_WORDS_PER_MINUTE = 200;
    const minutes = Math.ceil(words / AVERAGE_WORDS_PER_MINUTE);

    return accumulator + minutes;
  }, 0);

  return (
    <>
      <Header />
      <div className={styles.banner}>
        <img src={post.data.banner.url} alt={post.data.title} />
      </div>
      <main className={commonStyles.container}>
        <h1>{post.data.title}</h1>

        <div className={commonStyles.iconsConteiner}>
          <div className={commonStyles.iconContent}>
            <CalendarIcon />
            <time>{formatDate(new Date(post.first_publication_date))}</time>
          </div>
          <div className={commonStyles.iconContent}>
            <UserIcon />
            <span>{post.data.author}</span>
          </div>
          <div className={commonStyles.iconContent}>
            <ClockIcon />
            <span>{readTime} min</span>
          </div>
        </div>

        {post.data.content.map(({ heading, body }) => (
          <div key={shortid()} className={styles.paragraph}>
            <h3>{heading}</h3>

            <div dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }} />
          </div>
        ))}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.Predicates.at('document.type', 'post')],
    { fetch: ['posts.uid'], pageSize: 10 }
  );

  const paths = posts.results.map(({ uid }) => ({ params: { slug: uid } }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  return {
    props: {
      post: response,
    },
  };
};
