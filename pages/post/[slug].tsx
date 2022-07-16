import Header from '../../components/Header';
import { sanityClient } from '../../lib/sanity.server';
import { Post } from '../../typings';
import { GetStaticProps } from 'next';
import { urlFor } from '../../lib/sanity';
import { PortableText as PortableTextComponent } from '@portabletext/react';
import { getImageDimensions } from '@sanity/asset-utils';
import urlBuilder from '@sanity/image-url';

// Barebones lazy-loaded image component
const ImageComponent = ({ value }: any) => {
    const { width, height } = getImageDimensions(value);
    return (
        <img
            src={urlBuilder(sanityClient).image(value).width(width).height(height).url()}
            alt={value.alt || ' '}
            loading="lazy"
        />
    );
};

const PortableText = (props: any) => (
    <PortableTextComponent
        components={{
            block: {
                h1: ({ children }: any) => <h1 className="text-2xl font-bold my-5">{children}</h1>,
                h2: ({ children }: any) => <h2 className="text-xl font-bold my-5">{children}</h2>,
                li: ({ children }: any) => <li className="ml-4 list-disc">{children}</li>,
                link: ({ href, children }: any) => (
                    <a href={href} className="text-blue-500 hover:underline">
                        {children}
                    </a>
                ),
                p: ({ children }: any) => <p className="text-base my-5">{children}</p>,
            },
            types: {
                image: ImageComponent,
            },
        }}
        {...props}
    />
);

interface Props {
    post: Post;
}

function Post({ post }: Props) {
    return (
        <main>
            <Header />

            <img className="w-full h-80 object-cover" src={urlFor(post.mainImage).url()!} alt={post.title} />

            <article className="max-w-3xl mx-auto p-5">
                <h1 className="text-3xl mt-10 mb-3">{post.title}</h1>
                <h2 className="text-xl font-light text-gray-500 mb-2">{post.description}</h2>

                <div className="flex items-center space-x-2">
                    <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={urlFor(post.author.image).url()}
                        alt={post.author.name}
                    />
                    <p className="font-extralight text-sm">
                        Blog post by <span className="text-green-600">{post.author.name}</span> - Published at{' '}
                        {new Date(post._createdAt).toLocaleString()}
                    </p>
                </div>

                <div>
                    <PortableText
                        className=""
                        dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
                        projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!}
                        value={post.body}
                    />
                </div>
            </article>
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
        'comments': *[
            _type == 'comment' && post._ref == ^._id && approved == true
        ],
        mainImage,
        description,
        body,
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
