pipeline {
  options {
    disableConcurrentBuilds()
    buildDiscarder(logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '5', numToKeepStr: '5'))
  }
  agent {
    node {
      label 'ubuntu-18.04'
    }
  }
  stages {
    stage('INIT') {
      steps {
        nodejs('nodejs-10') {
          sh 'cd dao-web-app/ && npm install'
        }
      }
    }
    stage('Deliver for development') {
      when {
        branch 'add_jenkins'
      }
      steps {
        nodejs('nodejs-10') {
          sh 'npm run build'
          archiveArtifacts(artifacts: 'dao-web-app/dist/', onlyIfSuccessful: true)
        }
      }
    }
  }
}
