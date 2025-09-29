import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Easy to Use',
    Svg: require('@site/static/img/mountain.svg').default,
    description: (
      <>
        Qirvo docs have been designed to be as simple as possible for both users and developers.
      </>
    ),
  },
  {
    title: 'Get Started Quickly',
    Svg: require('@site/static/img/tree.svg').default,
    description: (
      <>
        Get started quickly with the documentation, and find what you need with ease.
      </>
    ),
  },
  {
    title: 'For Users and Developers',
    Svg: require('@site/static/img/react.svg').default,
    description: (
      <>
        Our documentation is tailored for both end-users and developers, ensuring everyone finds the information they need.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
