import styles from './About.module.css'
import Logo from "../../components/reusables/Logo";
import React from "react";

export default function About() {
  return (

    <div className={styles.page_container}>
      <div className={styles.header_box}>
        <h1 className={styles.title_text}>
          About <Logo/>
        </h1>
      </div>
      <div className={styles.content_container}>
        <h2>The Goal</h2>

        <p>
          Through the development of <Logo/>, our aim is to provide tools that can be used to make
          better informed decisions when it comes to the organisation of the democratic process.
          We are dedicated to providing an accessible and engaging platform to present scientific
          insights to a general audience.
        </p>

        <p>
          Use this website to discover which voting rule you prefer when it comes to participatory
          budgeting; share your insights with your local politicians; and maybe, change the world!
        </p>

        <h2>The Team</h2>

        <p>
          <Logo/> is a project that came to life at
          the <a href="https://www.illc.uva.nl/">Institute for Logic, Language and Computation of the University of Amsterdam</a> in
          the Computational Social Choice Group led by <a href="https://staff.science.uva.nl/u.endriss/">Ulle Endriss</a>.
        </p>

        <p>
          <a href="https://markus-utke.github.io/">Markus Utke</a> has been the
          main developer for the project, helped (marginally) by <a href="https://simonrey.fr">Simon Rey</a>.
        </p>

        <p>
          Please get in touch with either Markus or Simon if you have any thoughts you would
          like to share!
        </p>
      </div>
    </div>
  )
}
