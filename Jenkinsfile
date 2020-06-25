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
    stage('BUILD') {
      parallel {
        stage('build web') {
          steps {
            nodejs('nodejs-10') {
              sh 'printenv'
              sh 'npm run build'
            }
          }
        }
      }
    }
    stage('Archive') {
      parallel {
        stage('archive web') {
          steps {
            /* this list should match the list of api volumes in docker-compose.yml! */
            archiveArtifacts(artifacts: 'dao-web-app/dist/', onlyIfSuccessful: true)
          }
        }
      }
    }
  }
}
