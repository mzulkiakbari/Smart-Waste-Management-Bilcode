allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

val newBuildDir: Directory =
    rootProject.layout.buildDirectory
        .dir("../../build")
        .get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
}

subprojects {
    project.evaluationDependsOn(":app")
}

subprojects {
    val configureCompileSdk: (Project) -> Unit = { proj ->
        proj.extensions.findByType(com.android.build.gradle.BaseExtension::class.java)?.apply {
            compileSdkVersion(36)
        }
    }
    if (state.executed) {
        configureCompileSdk(this)
    } else {
        afterEvaluate {
            configureCompileSdk(this)
        }
    }
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
