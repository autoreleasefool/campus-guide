package ca.josephroque.uottawacampusguide;

import android.os.Build;
import android.support.v4.widget.DrawerLayout;
import android.os.Bundle;
import android.support.v7.app.ActionBarDrawerToggle;
import android.support.v7.app.AppCompatActivity;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;

import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdView;

import ca.josephroque.uottawacampusguide.adapter.DrawerAdapter;
import ca.josephroque.uottawacampusguide.fragment.NavigationDrawerFragment;

public class MainActivity extends AppCompatActivity
    implements NavigationDrawerFragment.NavigationCallbacks,
        DrawerAdapter.NavigationDrawerEventHandler
{

    private DrawerLayout mDrawerLayout;
    private NavigationDrawerFragment mDrawerFragment;
    private ActionBarDrawerToggle mDrawerToggle;

    private int mDrawerTitle;
    private int mTitle;

    private AdView mAdViewMainBanner;

    @Override
    protected void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        mDrawerLayout = (DrawerLayout) findViewById(R.id.main_drawer_layout);
        mDrawerFragment = (NavigationDrawerFragment) getSupportFragmentManager()
                .findFragmentById(R.id.main_navigation_fragment);
        mDrawerToggle = new ActionBarDrawerToggle(this, mDrawerLayout,
                R.string.navigation_drawer_open, R.string.navigation_drawer_close)
        {

            @Override
            public void onDrawerClosed(View view)
            {
                super.onDrawerClosed(view);
                invalidateOptionsMenu();
            }

            @Override
            public void onDrawerOpened(View view)
            {
                super.onDrawerOpened(view);
                invalidateOptionsMenu();
            }
        };
        mDrawerLayout.setDrawerListener(mDrawerToggle);

        mAdViewMainBanner = (AdView) findViewById(R.id.main_adview_bottom);
        mAdViewMainBanner.setAdListener(new AdListener()
        {
            @Override
            public void onAdLoaded()
            {
                runOnUiThread(new Runnable()
                {
                    @Override
                    public void run()
                    {
                        mAdViewMainBanner.setVisibility(View.VISIBLE);
                    }
                });
            }

            @Override
            public void onAdFailedToLoad(int errorCode)
            {
                runOnUiThread(new Runnable()
                {
                    @Override
                    public void run()
                    {
                        mAdViewMainBanner.setVisibility(View.GONE);
                        mAdViewMainBanner.destroy();
                    }
                });
            }
        });
        AdRequest.Builder adBuilder = new AdRequest.Builder();
        adBuilder.addTestDevice("B3EEABB8EE11C2BE770B684D95219ECB");
        mAdViewMainBanner.loadAd(adBuilder.build());
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu)
    {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item)
    {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings)
        {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    @Override
    public void navigationSettingsClicked()
    {

    }

    @Override
    public void onNavigationItemClicked(CharSequence itemName)
    {

    }
}
