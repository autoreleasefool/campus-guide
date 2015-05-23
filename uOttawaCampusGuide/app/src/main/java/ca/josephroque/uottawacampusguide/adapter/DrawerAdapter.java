package ca.josephroque.uottawacampusguide.adapter;

import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import ca.josephroque.uottawacampusguide.R;

/**
 * Created by Joseph Roque on 15-05-22.
 * <p/>
 * Manages data which will be displayed in the Navigation Drawer
 */
public class DrawerAdapter extends RecyclerView.Adapter<DrawerAdapter.DrawerViewHolder>
{

    private NavigationDrawerEventHandler mEventHandler;

    private static final int[] mDrawerItemIcons = {
            R.drawable.ic_home,
            R.drawable.ic_navigation,
            R.drawable.ic_favorite,
            R.drawable.ic_link,
            R.drawable.ic_bus,
            R.drawable.ic_accessibility,
            R.drawable.ic_whatshot,
            R.drawable.ic_settings,
    };

    public static final CharSequence[] mDrawerItemNames = {
            "Home",
            "Find",
            "Favourites",
            "Useful Links",
            "Bus Information",
            "Accessibility",
            "Campus Hotspots",
            "Settings",
    };

    public static class DrawerViewHolder extends RecyclerView.ViewHolder
    {
        private ImageView mImageViewItemIcon;
        private TextView mTextViewItemName;

        private DrawerViewHolder(View itemLayoutView)
        {
            super(itemLayoutView);
            mImageViewItemIcon = (ImageView) itemLayoutView.findViewById(R.id.iv_drawer_item_icon);
            mTextViewItemName = (TextView) itemLayoutView.findViewById(R.id.tv_drawer_item_name);
        }
    }

    public DrawerAdapter(NavigationDrawerEventHandler handler)
    {
        mEventHandler = handler;
    }

    @Override
    public DrawerViewHolder onCreateViewHolder(ViewGroup parent, int viewType)
    {
        View itemView = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.list_navigation, parent, false);
        return new DrawerViewHolder(itemView);
    }

    @Override
    public void onBindViewHolder(final DrawerViewHolder viewHolder, final int position)
    {
        viewHolder.mTextViewItemName.setText(mDrawerItemNames[position]);
        viewHolder.mImageViewItemIcon.setImageResource(mDrawerItemIcons[position]);
        viewHolder.itemView.setOnClickListener(new View.OnClickListener()
        {
            @Override
            public void onClick(View v)
            {
                mEventHandler.onNavigationItemClicked(mDrawerItemNames[position]);
            }
        });
    }

    @Override
    public int getItemCount()
    {
        return mDrawerItemNames.length;
    }

    public interface NavigationDrawerEventHandler
    {
        void onNavigationItemClicked(CharSequence itemName);
    }
}
