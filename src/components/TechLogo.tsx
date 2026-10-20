import android from '../assets/tech/android.svg?url'
import androidstudio from '../assets/tech/androidstudio.svg?url'
import aws from '../assets/tech/aws.svg?url'
import c from '../assets/tech/c.svg?url'
import css from '../assets/tech/css.svg?url'
import dart from '../assets/tech/dart.svg?url'
import espressif from '../assets/tech/espressif.svg?url'
import express from '../assets/tech/express.svg?url'
import netlify from '../assets/tech/netlify.svg?url'
import reactNative from '../assets/tech/react-native.svg?url'
import tailwindcss from '../assets/tech/tailwindcss.svg?url'
import expo from '../assets/tech/expo.svg?url'
import firebase from '../assets/tech/firebase.svg?url'
import flutter from '../assets/tech/flutter.svg?url'
import framer from '../assets/tech/framer.svg?url'
import git from '../assets/tech/git.svg?url'
import github from '../assets/tech/github.svg?url'
import html5 from '../assets/tech/html5.svg?url'
import javascript from '../assets/tech/javascript.svg?url'
import linux from '../assets/tech/linux.svg?url'
import mongodb from '../assets/tech/mongodb.svg?url'
import nextdotjs from '../assets/tech/nextdotjs.svg?url'
import nodedotjs from '../assets/tech/nodedotjs.svg?url'
import oracle from '../assets/tech/oracle.svg?url'
import postman from '../assets/tech/postman.svg?url'
import python from '../assets/tech/python.svg?url'
import react from '../assets/tech/react.svg?url'
import reactrouter from '../assets/tech/reactrouter.svg?url'
import render from '../assets/tech/render.svg?url'
import typescript from '../assets/tech/typescript.svg?url'
import vite from '../assets/tech/vite.svg?url'
import vscode from '../assets/tech/vscode.svg?url'

const logoUrls: Record<string, string> = {
  android: android, androidstudio: androidstudio, aws: aws, c: c, css: css, tailwindcss: tailwindcss, dart: dart, esp32: espressif, express: express,
  expo: expo, firebase: firebase, flutter: flutter, motion: framer, git: git, github: github, netlify: netlify,
  html: html5, javascript: javascript, linux: linux, mongodb: mongodb,
  nextjs: nextdotjs, node: nodedotjs, oracle: oracle, postman: postman,
  python: python, react: react, 'react-native': reactNative, 'react-router': reactrouter, render: render,
  typescript: typescript, vite: vite, vscode: vscode,
}

export default function TechLogo({ logo, name }: { logo: string; name: string }) {
  const url = logoUrls[logo]
  if (url) return <span className="tech-logo-chip" aria-hidden="true"><img src={url} alt="" /></span>
  return <span className="tech-logo-chip tech-logo-fallback" aria-hidden="true"><svg viewBox="0 0 32 32" role="presentation" aria-label={name}><path d="M16 4 27 16 16 28 5 16 16 4Z" /></svg></span>
}
