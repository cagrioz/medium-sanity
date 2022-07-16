import Header from '../../components/Header';
import { sanityClient } from '../../lib/sanity.server';
import { Post } from '../../typings';
import { GetStaticProps } from 'next';

interface Props {
    post: Post;
}

function Post({ post }: Props) {
    return (
        <main>
            <Header />
        </main>
    );
}

export default Post;

export const getStaticPaths = async () => {
    const query = `*[_type == 'post']  {
        _id,
        slug {
            current
        }
    }`;

    const posts = await sanityClient.fetch(query);

    const paths = posts.map((post: Post) => ({
        params: {
            slug: post.slug.current,
        },
    }));

    return {
        paths,
        fallback: false,
    };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const query = `*[_type == 'post' && slug.current == $slug][0]  {
        _id,
        _createdAt,
        title,
        slug {
            current
        },
        mainImage,
        description,
        author -> {
            name,
            image
        }
    }`;

    const post = await sanityClient.fetch(query, {
        slug: params?.slug,
    });

    return {
        props: {
            post,
        },
        revalidate: 60,
    };
};
