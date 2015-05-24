package ca.josephroque.uottawacampusguide;

import android.support.v4.widget.DrawerLayout;
import android.os.Bundle;
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

    private NavigationDrawerFragment mDrawerFragment;

    private AdView mAdViewMainBanner;

    @Override
    protected void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        mDrawerFragment = (NavigationDrawerFragment) getSupportFragmentManager()
                .findFragmentById(R.id.main_navigation_fragment);
        mDrawerFragment.setup(R.id.main_navigation_fragment,
                (DrawerLayout) findViewById(R.id.main_drawer_layout));

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
    protected void onResume()
    {
        super.onResume();

        if (mAdViewMainBanner != null && mAdViewMainBanner.getVisibility() == View.VISIBLE)
            mAdViewMainBanner.resume();
    }

    @Override
    protected void onPause()
    {
        super.onPause();

        if (mAdViewMainBanner != null && mAdViewMainBanner.getVisibility() == View.VISIBLE)
            mAdViewMainBanner.pause();
    }

    @Override
    protected void onDestroy()
    {
        super.onDestroy();

        if (mAdViewMainBanner != null && mAdViewMainBanner.getVisibility() == View.VISIBLE)
            mAdViewMainBanner.destroy();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu)
    {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onPrepareOptionsMenu(Menu menu)
    {
        //Sets menu items visibility depending on if navigation drawer is open
        boolean drawerOpen = mDrawerFragment.isDrawerOpen();
        menu.findItem(R.id.action_settings).setVisible(!drawerOpen);
        return super.onPrepareOptionsMenu(menu);
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
