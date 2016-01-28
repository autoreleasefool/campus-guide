package ca.josephroque.campusguide;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;

import java.util.Arrays;
import java.util.List;

import com.i18n.reactnativei18n.ReactNativeI18n;

public class MainActivity extends ReactActivity {

  /** React Instance Manager. */
  private ReactInstanceManager mReactInstanceManager;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    mReactInstanceManager = ReactInstanceManager.builder()
        .setApplication(getApplication())
        .addPackage(new ReactNativeI18n())  // <---- add this line
        .build();
  }

  /**
   * Returns the name of the main component registered from JavaScript.
   * This is used to schedule rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "CampusGuide";
  }

  /**
   * Returns whether dev mode should be enabled.
   * This enables e.g. the dev menu.
   */
  @Override
  protected boolean getUseDeveloperSupport() {
    return BuildConfig.DEBUG;
  }

 /**
 * A list of packages used by the app. If the app uses additional views
 * or modules besides the default ones, add more packages here.
 */
  @Override
  protected List<ReactPackage> getPackages() {
    return Arrays.<ReactPackage>asList(
      new MainReactPackage());
  }
}
